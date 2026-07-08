const net = require('net');

// GPS NMEA定位解析
function autoParse(buf) {
  const str = buf.toString().trim();
  if (!str.startsWith('$G')) return null;
  try {
    const arr = str.split(',');
    const status = arr[2] === 'A' ? '有效定位' : '无定位';
    function convert(val, dir) {
      if (!val) return null;
      const deg = Math.floor(val / 100);
      const min = (val / 100 - deg) * 60;
      let res = deg + min / 60;
      if (dir === 'S' || dir === 'W') res = -res;
      return Number(res.toFixed(6));
    }
    const lat = convert(Number(arr[3]), arr[4]);
    const lng = convert(Number(arr[5]), arr[6]);
    return { lat, lng, status };
  } catch (e) {
    return null;
  }
}

module.exports = app => {
  app.tcpClients = new Map();
  app.deviceMap = new Map();
  app.ipBindSn = new Map();

  const server = net.createServer(socket => {
    const clientKey = `${socket.remoteAddress}:${socket.remotePort}`;
    const publicIp = socket.remoteAddress;

    const clientMeta = {
      socket,
      clientKey,
      publicIp,
      sn: null,
      cid: null,
      type: null,
      lastHeart: Date.now()
    };
    app.tcpClients.set(clientKey, clientMeta);
    app.logger.info(`[TCP] 通道上线 ${clientKey} 公网IP:${publicIp}`);

    // 已有绑定SN则自动回填SN、CID
    if (app.ipBindSn.has(publicIp)) {
      const bindSn = app.ipBindSn.get(publicIp);
      clientMeta.sn = bindSn;
      const dev = app.deviceMap.get(bindSn);
      if (dev?.cid) clientMeta.cid = dev.cid;
      app.logger.info(`[自动绑定] ${clientKey} SN:${bindSn} CID:${clientMeta.cid || '无'}`);
    }

    socket.on('data', buffer => {
      try {
        const raw = buffer.toString().trim();
        if (!raw) return;
        app.logger.info(`[TCP][SN:${clientMeta.sn || '未注册'}][CID:${clientMeta.cid || '无'}] [${clientKey}] 数据：${raw}`);

        if (raw === 'www.usr.cn') return;

        // 1、DTU注册SN（纯数字串）
        if (/^[0-9]{18,}$/.test(raw)) {
          const devSn = raw;
          clientMeta.sn = devSn;
          app.ipBindSn.set(publicIp, devSn);

          if (!app.deviceMap.has(devSn)) {
            app.deviceMap.set(devSn, {
              sn: devSn,
              cid: null,
              gpsChannel: null,
              businessChannel: null,
              lastOnline: Date.now(),
              lastHeart: 0
            });
          }
          const devInfo = app.deviceMap.get(devSn);
          devInfo.lastOnline = Date.now();

          // 同IP所有连接同步SN
          for (const [ck, meta] of app.tcpClients.entries()) {
            if (meta.publicIp === publicIp) {
              meta.sn = devSn;
              if (devInfo.cid) meta.cid = devInfo.cid;
              if (meta.type === 'gps') devInfo.gpsChannel = ck;
              if (meta.type === 'business') devInfo.businessChannel = ck;
            }
          }
          app.logger.info(`[设备注册] SN:${devSn} IP:${publicIp}`);
          return;
        }

        // 2、GPS NMEA报文通道
        if (raw.startsWith('$G')) {
          clientMeta.type = 'gps';
          const gpsInfo = autoParse(buffer);
          if (!gpsInfo) return;
          if (clientMeta.sn && app.deviceMap.has(clientMeta.sn)) {
            app.deviceMap.get(clientMeta.sn).gpsChannel = clientKey;
          }
          if (app.io && app.io.of('/')) {
            app.io.of('/').emit('gps', {
              sn: clientMeta.sn,
              cid: clientMeta.cid,
              clientKey,
              lat: gpsInfo.lat,
              lng: gpsInfo.lng,
              status: gpsInfo.status,
              time: new Date().toLocaleString()
            });
          }
          return;
        }

        // 3、业务心跳JSON {"cmd":"heart","type":"ld100","id":"002026063001","sn":284}
        if (raw.startsWith('{')) {
          clientMeta.type = 'business';
          clientMeta.lastHeart = Date.now();
          const data = JSON.parse(raw);

          // 提取报文内id作为全局CID
          if (data.id) {
            clientMeta.cid = data.id;
            if (clientMeta.sn && app.deviceMap.has(clientMeta.sn)) {
              const dev = app.deviceMap.get(clientMeta.sn);
              dev.cid = data.id;
              dev.lastHeart = Date.now();
              dev.businessChannel = clientKey;
              // 同IP下GPS通道同步CID
              for (const [ck, meta] of app.tcpClients.entries()) {
                if (meta.publicIp === publicIp) {
                  meta.cid = data.id;
                }
              }
            }
          }

          // 推送业务心跳
          if (app.io && app.io.of('/')) {
            app.io.of('/').emit('deviceData', {
              sn: clientMeta.sn,
              cid: clientMeta.cid,
              clientKey,
              payload: data,
              time: new Date().toLocaleString()
            });
          }
          return;
        }

        app.logger.warn(`[未知报文] SN:${clientMeta.sn} CID:${clientMeta.cid} ${clientKey} ${raw}`);
      } catch (err) {
        app.logger.error('[TCP数据解析异常]', err);
      }
    });

    socket.on('end', () => handleSocketClose(clientKey, clientMeta, app));
    socket.on('error', err => {
      app.logger.error(`[通道异常断开] ${clientKey} SN:${clientMeta.sn} CID:${clientMeta.cid}`, err.message);
      handleSocketClose(clientKey, clientMeta, app);
    });
  });

  // 统一关闭清理逻辑
  function handleSocketClose(clientKey, meta, app) {
    app.tcpClients.delete(clientKey);
    const { sn, publicIp, type, cid } = meta;
    app.logger.info(`[通道离线] ${clientKey} SN:${sn || '无'} CID:${cid || '无'} 类型:${type || '未知'}`);

    if (sn && app.deviceMap.has(sn)) {
      const dev = app.deviceMap.get(sn);
      if (type === 'gps' && dev.gpsChannel === clientKey) dev.gpsChannel = null;
      if (type === 'business' && dev.businessChannel === clientKey) dev.businessChannel = null;

      // 双通道全部离线，清空设备缓存
      if (!dev.gpsChannel && !dev.businessChannel) {
        app.deviceMap.delete(sn);
        app.ipBindSn.delete(publicIp);
        app.logger.info(`[设备完全下线] SN:${sn} CID:${dev.cid}`);
      }
    }
  }

  server.listen(60000, '0.0.0.0');
  server.on('listening', () => {
    app.logger.info('==================================================');
    app.logger.info('✅ TCP服务启动成功 监听端口60000');
    app.logger.info('==================================================');
  });

  // 3分钟无心跳定时清理设备
  setInterval(() => {
    const now = Date.now();
    const expire = now - 3 * 60 * 1000;
    app.logger.info('======开始定时清理离线设备=======');
    for (const [sn, dev] of app.deviceMap.entries()) {
      if (dev.lastHeart < expire && !dev.gpsChannel && !dev.businessChannel) {
        app.deviceMap.delete(sn);
        app.ipBindSn.delete(sn);
        app.logger.warn(`[定时清理离线设备] SN:${sn} CID:${dev.cid}`);
      }
    }
  }, 60000);
};
