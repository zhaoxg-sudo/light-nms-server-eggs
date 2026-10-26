const net = require('net');
const { Pool, Client } = require('pg')
const pool = require('../pgpool');
// GPS NMEA定位解析
// function autoParse(buf) {
//   const str = buf.toString().trim();
//   if (!str.startsWith('$G')) return null;
//   try {
//     const arr = str.split(',');
//     const status = arr[2] === 'A' ? '有效定位' : '无效定位';
//     function convert(val, dir) {
//       if (!val) return null;
//       const deg = Math.floor(val / 100);
//       const min = (val / 100 - deg) * 60;
//       let res = deg + min / 60;
//       if (dir === 'S' || dir === 'W') res = -res;
//       return Number(res.toFixed(6));
//     }
//     const lat = convert(Number(arr[3]), arr[4]);
//     const lng = convert(Number(arr[5]), arr[6]);
//     return { lat, lng, status };
//   } catch (e) {
//     return null;
//   }
// }
function autoParse(buf) {
  const str = buf.toString().trim();
  if (!str.startsWith('$G')) return null;
  try {
    const arr = str.split(',');
    const gpsValid = arr[2] === 'A';
    const status = gpsValid ? '有效定位' : '无效定位';

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
    return { lat, lng, status, valid: gpsValid };
  } catch (e) {
    return null;
  }
}

module.exports = app => {
  // tcpClients增加GPS位置
  app.tcpClients = new Map();
  app.deviceMap = new Map();
  app.ipBindSn = new Map();
  app.tcpCleanTimer = null;
  
  // ✅【原有保留：设备业务状态变更主动推送，仅在online/offline切换时触发】
  app.emitDeviceStatusChange = function (dev, newStatus) {
    if (app.io && app.io.of('/')) {
      app.io.of('/').emit('deviceonoffline', {
        sn: dev.sn,
        cid: dev.cid,
        status: newStatus,
        time: new Date().toLocaleString()
      });
      app.logger.info(`[设备状态变更] SN:${dev.sn} CID:${dev.cid} -> ${newStatus}`);
    }
  }
  // ==========【新增】GPS通道状态推送，格式完全对齐上面 ==========
  app.emitGpsChannelStatusChange = function (meta, newStatus) {
    if (app.io && app.io.of('/')) {
      app.io.of('/').emit('gpschannelonoffline', {
        sn: meta.sn,
        cid: meta.cid,
        status: newStatus,
        time: new Date().toLocaleString()
      });
      app.logger.info(`[GPS通道状态变更] SN:${meta.sn} CID:${meta.cid} -> ${newStatus}`);
    }
  }
  //【新增】应答超时管理器
  app.waitReplyMap = new Map();
  const REPLY_TIMEOUT = 3000;
  
  //【新增】创建等待应答Promise任务
  app.createWaitReplyTask = function (msgId, target) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        app.waitReplyMap.delete(msgId);
        reject({ success: false, msg: '指令下发成功，设备应答超时' });
      }, REPLY_TIMEOUT);
      app.waitReplyMap.set(msgId, { resolve, reject, timer, target });
    });
  };
  
  //【新增】设备应答回执，匹配msgId完成等待任务
  app.handleDeviceReply = function (msgId, replyData) {
    if (!app.waitReplyMap.has(msgId)) return;
    const task = app.waitReplyMap.get(msgId);
    clearTimeout(task.timer);
    app.waitReplyMap.delete(msgId);
    task.resolve({ success: true, msg: '设备应答成功', data: replyData });
  };
  //【新增】兜底清理滞留应答任务
  setInterval(() => {
    for (const [mid, task] of app.waitReplyMap.entries()) {
      if (!task.timer) app.waitReplyMap.delete(mid);
    }
  }, 60000);
  // ==========【新增接口函数】==========
  // 大屏调用 /api/getDeviceList，仅业务设备
  app.getDeviceList = function () {
    const list = []
    for (const [sn, dev] of app.deviceMap.entries()) {
      const businessMeta = app.tcpClients.get(dev.businessChannel);
      list.push({
        sn,
        cid: dev.cid,
        clientKey: dev.businessChannel,
        publicIp: (businessMeta && businessMeta.publicIp) || null,
        status: dev.status,
        lastBusinessHeart: dev.lastBusinessHeart
      })
    }
    return list
  }
  // GPS独立列表接口：遍历所有GPS通道tcpClients，不依赖deviceMap
  // 
  app.getGpsChannelList = function () {
    const GPS_EXPIRE_MS = 3 * 60 * 1000;
    const list = []
    for (const [clientKey, gpsMeta] of app.tcpClients.entries()) {
      if (!gpsMeta || gpsMeta.type !== 'gps') continue
      const now = Date.now()
      let gpsStatus = 'offline'
      if (gpsMeta.lastGpsHeart && (now - gpsMeta.lastGpsHeart < GPS_EXPIRE_MS)) {
        gpsStatus = gpsMeta.gpsStatus || 'online'
      }
      list.push({
        sn: gpsMeta.sn || null,
        cid: gpsMeta.cid || null,
        clientKey,
        publicIp: gpsMeta.publicIp || null,
        gpsStatus,
        lastGpsHeart: gpsMeta.lastGpsHeart || null,
        lat: typeof gpsMeta.lat !== 'undefined' ? gpsMeta.lat : null,
        lng: typeof gpsMeta.lng !== 'undefined' ? gpsMeta.lng : null,
        gpsValid: typeof gpsMeta.gpsValid !== 'undefined' ? gpsMeta.gpsValid : false
      })
    }
    return list
  }
  
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
      lat: null,
      lng:null,
      lastGpsHeart: 0,
      gpsStatus: 'offline'
    };
    app.tcpClients.set(clientKey, clientMeta);
    app.logger.info(`[TCP] 通道上线 ${clientKey} 公网IP:${publicIp}`);
    if (app.ipBindSn.has(publicIp)) {
      const bindSn = app.ipBindSn.get(publicIp);
      clientMeta.sn = bindSn;
      const dev = app.deviceMap.get(bindSn);
      if (dev && dev.cid) clientMeta.cid = dev.cid;
      app.logger.info(`[自动绑定] ${clientKey} SN:${bindSn} CID:${clientMeta.cid || '无'}`);
    }
    socket.on('data', async buffer => {
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
              status: 'offline',
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
        // if (raw.startsWith('$G')) {
        //   clientMeta.type = 'gps';
        //   const gpsInfo = autoParse(buffer);
          
        //   if (!gpsInfo) return;
        //   clientMeta.lastGpsHeart = Date.now();
        //   if (clientMeta.sn && app.deviceMap.has(clientMeta.sn)) {
        //     const dev = app.deviceMap.get(clientMeta.sn);
        //     dev.gpsChannel = clientKey;
        //     dev.lastGpsHeart = Date.now();
        //   }
        //   // GPS通道状态跃迁，状态存在clientMeta
        //   if(clientMeta.gpsStatus !== 'online'){
        //     clientMeta.gpsStatus = 'online';
        //     app.emitGpsChannelStatusChange(clientMeta, 'online');
        //   }

        //   app.logger.info('[GPS] ' + 'lat=' + gpsInfo.lat + ' , '  + 'lng='+ gpsInfo.lng + ' , '  + 'status='+ gpsInfo.status)
        //   if (app.io && app.io.of('/')) {
        //     app.io.of('/').emit('gps', {
        //       sn: clientMeta.sn,
        //       cid: clientMeta.cid,
        //       clientKey,
        //       lat: gpsInfo.lat,
        //       lng: gpsInfo.lng,
        //       status: gpsInfo.status,
        //       time: new Date().toLocaleString()
        //     });
        //   }
        //   return;
        // }
        // 2、GPS报文：只更新GPS独立心跳
        if (raw.startsWith('$G')) {
          clientMeta.type = 'gps';
          const gpsInfo = autoParse(buffer);
          
          if (!gpsInfo) return;
          const recvSn = clientMeta.sn;
          // 没有SN的GPS报文直接丢弃
          if (!recvSn) {
            app.logger.warn(`[GPS通道] 报文有GPS数据，但尚未绑定SN，clientKey:${clientKey}`);
            return;
          }

          try {
            const res = await pool.query(
              'SELECT dtusn, catalogid FROM power_station_tree WHERE dtusn = $1 LIMIT 1',
              [recvSn]
            );
            let dbCid = null;
            let newGpsStatus = 'unknown';

            if (res.rows.length > 0) {
              const row = res.rows[0];
              dbCid = row.catalogid;
              newGpsStatus = 'online';
            } else {
              app.logger.warn(`[GPS未知通道] clientKey:${clientKey}, ip:${clientMeta.publicIp}, DTUSN:${recvSn} 在power_station_tree无注册，标记unknown`);
              dbCid = null;
            }

            clientMeta.lastGpsHeart = Date.now();
            clientMeta.cid = dbCid;
            clientMeta.lat = gpsInfo.lat;
            clientMeta.lng = gpsInfo.lng;
            clientMeta.gpsValid = gpsInfo.valid;

            if (clientMeta.sn && app.deviceMap.has(clientMeta.sn)) {
              const dev = app.deviceMap.get(clientMeta.sn);
              dev.gpsChannel = clientKey;
              dev.lastGpsHeart = Date.now();
              dev.cid = dbCid;
            }

            // 状态变化才推送
            if(clientMeta.gpsStatus !== newGpsStatus){
              clientMeta.gpsStatus = newGpsStatus;
              app.emitGpsChannelStatusChange(clientMeta, newGpsStatus);
            }

            app.logger.info('[GPS] ' + 'lat=' + gpsInfo.lat + ' , '  + 'lng='+ gpsInfo.lng + ' , '  + 'status='+ gpsInfo.status)
            if (app.io && app.io.of('/')) {
              app.io.of('/').emit('gps', {
                sn: clientMeta.sn,
                cid: clientMeta.cid,
                clientKey,
                lat: gpsInfo.lat,
                lng: gpsInfo.lng,
                gpsValid: clientMeta.gpsValid,
                status: gpsInfo.status,
                time: new Date().toLocaleString()
              });
            }
          } catch (dbErr) {
            app.logger.error(`[GPS通道] 查询数据库异常 DTUSN:${recvSn}`, dbErr);
            return;
          }
          return;
        }

        // // 3、业务JSON心跳：只更新业务独立心跳
        // if (raw.startsWith('{')) {
        //   clientMeta.type = 'business';
        //   const data = JSON.parse(raw);
        //   //【新增】匹配应答msgId，触发等待任务resolve
        //   if (data.msgId) {
        //     app.handleDeviceReply(data.msgId, data);
        //   }
        //   if (data.id) {
        //     clientMeta.cid = data.id;
        //     if (clientMeta.sn && app.deviceMap.has(clientMeta.sn)) {
        //       const dev = app.deviceMap.get(clientMeta.sn);
        //       dev.cid = data.id;
        //       dev.lastBusinessHeart = Date.now(); // 独立业务心跳
        //       dev.businessChannel = clientKey;
        //       // ✅【修改1：只在状态变化时推送上线】
        //       if (dev.status !== 'online') {
        //         dev.status = 'online';
        //         app.emitDeviceStatusChange(dev, 'online');
        //       }
        //       for (const [ck, meta] of app.tcpClients.entries()) {
        //         if (meta.publicIp === publicIp) {
        //           meta.cid = data.id;
        //         }
        //       }
        //     }
        //   }
        //   if (app.io && app.io.of('/')) {
        //     app.io.of('/').emit('deviceData', {
        //       sn: clientMeta.sn,
        //       cid: clientMeta.cid,
        //       clientKey,
        //       payload: data,
        //       time: new Date().toLocaleString()
        //     });
        //   }
        //   return;
        // }
        // 3、业务JSON报文：区分 heart心跳 / code="1"应答 / alarm告警 / 其它
        if (raw.startsWith('{')) {
          let data;
          try {
            data = JSON.parse(raw);
          } catch (e) {
            app.logger.warn(`[JSON解析失败] ${clientKey} raw:${raw}`);
            return;
          }

          // 1、heart 心跳：更新心跳时间 + CID校验、变更设备状态（心跳不带msgId）
          if (data.cmd === 'heart') {
            clientMeta.type = 'business';
            if (data.id) {
              const incomingCid = data.id;
              clientMeta.cid = incomingCid;
              if (clientMeta.sn && app.deviceMap.has(clientMeta.sn)) {
                const dev = app.deviceMap.get(clientMeta.sn);
                dev.businessChannel = clientKey;
                dev.lastBusinessHeart = Date.now();

                try {
                  const res = await pool.query(
                    'SELECT dtusn, catalogid FROM power_station_tree WHERE dtusn = $1 LIMIT 1',
                    [clientMeta.sn]
                  );
                  if (res.rows.length > 0) {
                    const dbCid = res.rows[0].catalogid;
                    dev.cid = dbCid;
                    if (incomingCid !== dbCid) {
                      app.logger.warn(`[CID不匹配告警] SN:${clientMeta.sn} 库CID:${dbCid} 业务上报CID:${incomingCid}`);
                      if (dev.status !== 'unknown') {
                        dev.status = 'unknown';
                        app.emitDeviceStatusChange(dev, 'unknown');
                      }
                    } else {
                      if (dev.status !== 'online') {
                        dev.status = 'online';
                        app.emitDeviceStatusChange(dev, 'online');
                      }
                    }
                  } else {
                    app.logger.warn(`[业务通道未知SN] SN:${clientMeta.sn} 不在power_station_tree`);
                    if (dev.status !== 'unknown') {
                      dev.status = 'unknown';
                      app.emitDeviceStatusChange(dev, 'unknown');
                    }
                  }
                } catch (dbErr) {
                  app.logger.error(`[业务心跳查询库失败] SN:${clientMeta.sn}`, dbErr);
                }

                // 同IP通道同步cid
                for (const [ck, meta] of app.tcpClients.entries()) {
                  if (meta.publicIp === publicIp) {
                    meta.cid = incomingCid;
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

          // 2、alarm 告警消息：仅日志+透传，不处理回执、不刷新心跳、不修改状态
          if (data.cmd === 'alarm') {
            app.logger.info(`[设备告警上报] SN:${clientMeta.sn}, alarmData:`, data);
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

          // 3、应答消息 code === "1"：只处理回执，【不修改设备状态、不刷新心跳、不查库】
          if (data.code === '1') {
            if (data.msgId) {
              app.handleDeviceReply(data.msgId, data);
            }
            app.logger.info(`[设备应答回执] SN:${clientMeta.sn} msgId:${data.msgId}`);
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

          // 其余所有JSON报文：原样透传
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
    // end 仅打日志，不调用关闭函数
    socket.on('end', () => {
      app.logger.info(`[socket end] clientKey:${clientKey} 对端关闭写入`);
    });
    // 所有场景统一交给close事件处理，只执行一次
    socket.on('close', (hadError) => handleSocketClose(clientKey, clientMeta, app));

    // socket.on('end', () => handleSocketClose(clientKey, clientMeta, app));
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

    // GPS通道断开，推送离线事件，状态维护在meta
    if(type === 'gps' && meta.gpsStatus === 'online'){
      meta.gpsStatus = 'offline';
      app.emitGpsChannelStatusChange(meta, 'offline');
    }

    if (sn && app.deviceMap.has(sn)) {
      const dev = app.deviceMap.get(sn);
      if (type === 'gps' && dev.gpsChannel === clientKey) {
        dev.gpsChannel = null;
      }
      if (type === 'business' && dev.businessChannel === clientKey) {
        dev.businessChannel = null;
        // ✅【修改2：只在状态变化时推送下线】
        if (dev.status === 'online') {
          dev.status = 'offline';
          app.emitDeviceStatusChange(dev, 'offline');
        }
      }
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
    
      // GPS通道心跳超时检测（只遍历tcpClients）
      for (const [ck, meta] of app.tcpClients.entries()) {
        if (meta.type === 'gps') {
          const gpsExpire = meta.lastGpsHeart < expire;
          if (gpsExpire) {
            app.logger.warn(`[GPS通道心跳超时] clientKey:${ck}, SN:${meta.sn}`);
            if(meta.gpsStatus === 'online'){
              meta.gpsStatus = 'offline';
              app.emitGpsChannelStatusChange(meta, 'offline');
            }
            meta.socket.destroy();
          }
        }
      }
    
      // 业务设备心跳校验（原有逻辑保留）
      const snList = Array.from(app.deviceMap.keys());
      app.logger.info('======snList=====', snList);
      for (const sn of snList) {
        const dev = app.deviceMap.get(sn);
        if (!dev) continue;
    
        // 业务心跳超时判断
        const busExpire = dev.lastBusinessHeart < expire;
    
        // GPS超时判断：取dev.gpsChannel对应的tcpMeta
        let gpsExpire = true;
        if(dev.gpsChannel && app.tcpClients.has(dev.gpsChannel)){
          const gpsMeta = app.tcpClients.get(dev.gpsChannel);
          gpsExpire = gpsMeta.lastGpsHeart < expire;
        }
    
        app.logger.info(`[设备状态校验] SN:${sn} CID:${dev.cid} 业务超时:${busExpire}, GPS超时:${gpsExpire}`);
    
        // 业务心跳单独超时处理（只改业务状态，不删除设备）
        if(busExpire){
          if(dev.status === 'online'){
            dev.status = 'offline';
            app.emitDeviceStatusChange(dev, 'offline');
            app.logger.warn(`[业务心跳超时下线] SN:${sn} 业务超过3分钟无报文`);
          }
          if(dev.businessChannel){
            app.tcpClients.delete(dev.businessChannel);
            dev.businessChannel = null;
          }
        }
    
        // =====================【保留需求】GPS、业务通道均长期无数据，清理整台设备 =====================
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
    //【新增】进程退出清空所有应答等待定时器
    for (const task of app.waitReplyMap.values()) {
      clearTimeout(task.timer);
    }
    app.waitReplyMap.clear();
  });
};
