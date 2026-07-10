const net = require('net');

// GPS NMEA定位解析
function autoParse(buf) {
  const str = buf.toString().trim();
  if (!str.startsWith('$G')) return null;
  try {
    const arr = str.split(',');
    const status = arr[2] === 'A' ? '有效定位' : '无效定位';
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
  app.tcpCleanTimer = null;

  // 下发工具函数
  app.sendTcpCmd = function (payload, target) {
    const sendStr = JSON.stringify(payload);
    let targetMetaList = [];

    if (target.includes(':')) {
      const meta = app.tcpClients.get(target);
      if (meta) targetMetaList.push(meta);
    } else {
      for (const dev of app.deviceMap.values()) {
        if (dev.sn === target || dev.cid === target) {
          const businessMeta = app.tcpClients.get(dev.businessChannel);
          if (businessMeta) targetMetaList.push(businessMeta);
        }
      }
    }

    if (targetMetaList.length === 0) {
      return { success: false, msg: `未找到设备业务通道，目标:${target}` };
    }

    let sendCount = 0;
    for (const meta of targetMetaList) {
      if (meta.type !== 'business') {
        app.logger.warn(`[下发转发] ${meta.clientKey} 是GPS通道，自动转发同设备业务通道`);
        const devInfo = app.deviceMap.get(meta.sn);
        if (!devInfo?.businessChannel) continue;
        const businessMeta = app.tcpClients.get(devInfo.businessChannel);
        if (!businessMeta || businessMeta.socket.destroyed) continue;
        if (businessMeta.socket.writable) {
          businessMeta.socket.write(sendStr);
          app.logger.info(`[TCP下发成功(转发)] 源通道${meta.clientKey} 实际下发${businessMeta.clientKey} SN:${businessMeta.sn} CID:${businessMeta.cid} 内容:${sendStr}`);
          sendCount++;
        }
        continue;
      }
      if (meta.socket.writable) {
        meta.socket.write(sendStr);
        app.logger.info(`[TCP下发成功] ${meta.clientKey} SN:${meta.sn} CID:${meta.cid} 内容:${sendStr}`);
        sendCount++;
      } else {
        app.logger.error(`[下发失败] ${meta.clientKey} 通道不可写`);
      }
    }

    return sendCount > 0
      ? { success: true, msg: `成功下发至${sendCount}条业务通道`, count: sendCount }
      : { success: false, msg: '匹配到通道，但无可用业务连接' };
  };

  const server = net.createServer(socket => {
    const clientKey = `${socket.remoteAddress}:${socket.remotePort}`;
    const publicIp = socket.remoteAddress;
    // ======================【新增1】单连接2分钟空闲超时，清理4G静默断连僵死socket ======================
    const IDLE_TIMEOUT = 120000;
    socket.setTimeout(IDLE_TIMEOUT);
    socket.on('timeout', () => {
      app.logger.warn(`[连接空闲超时] ${clientKey} ${IDLE_TIMEOUT/1000}s无数据，主动销毁socket`);
      socket.destroy();
    });
    // ==========================================================================================
    const clientMeta = {
      socket,
      clientKey,
      publicIp,
      sn: null,
      cid: null,
      type: null,
    };
    app.tcpClients.set(clientKey, clientMeta);
    app.logger.info(`[TCP] 通道上线 ${clientKey} 公网IP:${publicIp}`);

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
        // ======================【新增2】收到任意报文重置超时计时器 ======================
        socket.setTimeout(IDLE_TIMEOUT);
        app.logger.info(`[TCP][SN:${clientMeta.sn || '未注册'}][CID:${clientMeta.cid || '无'}] [${clientKey}] 数据：${raw}`);

        if (raw === 'www.usr.cn') return;

        // 1、DTU注册SN
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
              lastBusinessHeart: 0,
              lastGpsHeart: 0
            });
          }
          const devInfo = app.deviceMap.get(devSn);
          devInfo.lastOnline = Date.now();

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

        // 2、GPS报文：只更新GPS独立心跳
        if (raw.startsWith('$G')) {
          clientMeta.type = 'gps';
          const gpsInfo = autoParse(buffer);
          
          if (!gpsInfo) return;
          if (clientMeta.sn && app.deviceMap.has(clientMeta.sn)) {
            const dev = app.deviceMap.get(clientMeta.sn);
            dev.gpsChannel = clientKey;
            dev.lastGpsHeart = Date.now(); // 独立GPS心跳时间
          }
          app.logger.info('[GPS] ' + 'lat=' + gpsInfo.lat + ' , '  + 'lng='+ gpsInfo.lng + ' , '  + 'status='+ gpsInfo.status)
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

        // 3、业务JSON心跳：只更新业务独立心跳
        if (raw.startsWith('{')) {
          clientMeta.type = 'business';
          const data = JSON.parse(raw);
          if (data.id) {
            clientMeta.cid = data.id;
            if (clientMeta.sn && app.deviceMap.has(clientMeta.sn)) {
              const dev = app.deviceMap.get(clientMeta.sn);
              dev.cid = data.id;
              dev.lastBusinessHeart = Date.now(); // 独立业务心跳
              dev.businessChannel = clientKey;
              for (const [ck, meta] of app.tcpClients.entries()) {
                if (meta.publicIp === publicIp) {
                  meta.cid = data.id;
                }
              }
            }
          }
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
        app.logger.error('[TCP数据处理异常]', err);
      }
    });

    socket.on('end', () => handleSocketClose(clientKey, clientMeta, app));
    socket.on('error', err => {
      app.logger.error(`[通道异常断开] ${clientKey} SN:${clientMeta.sn} CID:${clientMeta.cid}`, err.message);
      handleSocketClose(clientKey, clientMeta, app);
    });
  });

  // 通道离线清理
  function handleSocketClose(clientKey, meta, app) {
    app.tcpClients.delete(clientKey);
    const { sn, publicIp, type, cid } = meta;
    app.logger.info(`[通道离线] ${clientKey} SN:${sn || '无'} CID:${cid || '无'} 类型:${type || '未知'}`);

    if (sn && app.deviceMap.has(sn)) {
      const dev = app.deviceMap.get(sn);
      if (type === 'gps' && dev.gpsChannel === clientKey) dev.gpsChannel = null;
      if (type === 'business' && dev.businessChannel === clientKey) dev.businessChannel = null;

      // 双通道全部离线，清除设备缓存
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

    // 每分钟执行一次离线判断，超时3分钟
    if (app.tcpCleanTimer) clearInterval(app.tcpCleanTimer);
    app.tcpCleanTimer = setInterval(() => {
      const now = Date.now();
      const expire = now - 3 * 60 * 1000;
      app.logger.info('======开始60s定时校验设备离线状态=======');
      // ======================【新增3】定时主动清理已销毁残留socket ======================
      for (const [ck, meta] of app.tcpClients.entries()) {
        if (meta.socket.destroyed) {
          app.tcpClients.delete(ck);
          app.logger.warn(`[定时清理残留销毁连接] ${ck}`);
        }
      }
      // ================================================================================
      const snList = Array.from(app.deviceMap.keys());
      app.logger.info('======snList=====', snList);
      for (const sn of snList) {
        const dev = app.deviceMap.get(sn);
        if (!dev) continue;
        const gpsExpire = dev.lastGpsHeart < expire;
        const busExpire = dev.lastBusinessHeart < expire;

        // 打印单设备双通道状态
        app.logger.info(`[设备状态校验] SN:${sn} GPS超时:${gpsExpire} 业务超时:${busExpire}`);

        // GPS、业务通道均长期无数据，清理整台设备
        if (gpsExpire && busExpire) {
          // 断开残留通道
          if (dev.gpsChannel) app.tcpClients.delete(dev.gpsChannel);
          if (dev.businessChannel) app.tcpClients.delete(dev.businessChannel);
          app.deviceMap.delete(sn);
          app.ipBindSn.delete(dev.publicIp);
          app.logger.warn(`[设备整体离线清理] SN:${sn} GPS与业务均超过3分钟无报文`);
        }
      }
    }, 60000);
  });

  process.on('beforeExit', () => {
    if (app.tcpCleanTimer) clearInterval(app.tcpCleanTimer);
  });
};
