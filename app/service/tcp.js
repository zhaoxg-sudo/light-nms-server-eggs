'use strict'
const { Service } = require('egg')

// 生成唯一消息ID
function genMsgId() {
  return Date.now().toString() + '_' + Math.floor(Math.random() * 10000);
}

class TcpService extends Service {
  /**
   * 下发TCP指令（带应答超时等待）
   * @param {string} target clientKey / SN / CID
   * @param {string} content JSON字符串原始指令，如'{"cmd":"allOn"}'
   * @returns {Promise<{success:boolean, msg:string, data:any}>}
   */
  async send(target, content) {
    // 解析原始指令
    let payload;
    try {
      payload = JSON.parse(content);
    } catch (err) {
      return {
        success: false,
        msg: 'content必须是合法JSON字符串',
        data: null
      };
    }

    // 生成唯一msgId，注入下发报文
    const msgId = genMsgId();
    payload.msgId = msgId;
    const sendJson = JSON.stringify(payload);
    //【新增修改】报文末尾拼接回车换行 \r\n
    const sendFrame = sendJson + '\r\n';

    let writeSuccess = false;

    // 1. 传入 clientKey（带冒号）
    if (target.includes(':')) {
      const clientMeta = this.app.tcpClients.get(target)
      if (!clientMeta || clientMeta.socket.destroyed) {
        return { success: false, msg: '设备通道不在线', data: null }
      }

      // 如果当前是GPS通道，自动找同设备业务通道下发
      if (clientMeta.type !== 'business') {
        const devInfo = this.app.deviceMap.get(clientMeta.sn)
        if (!devInfo || !devInfo.businessChannel) {
          return { success: false, msg: '该GPS通道无配套在线业务通道', data: null }
        }
        const businessMeta = this.app.tcpClients.get(devInfo.businessChannel)
        if (!businessMeta || businessMeta.socket.destroyed) {
          return { success: false, msg: '配套业务通道已离线', data: null }
        }
        try {
          //【修改】使用带\r\n换行的sendFrame下发
          businessMeta.socket.write(Buffer.from(sendFrame))
          this.ctx.logger.info(`[GPS通道自动转发业务通道] source:${target} realSend:${businessMeta.clientKey} SN:${businessMeta.sn} CID:${businessMeta.cid} 内容:${sendJson}`)
          writeSuccess = true;
        } catch (err) {
          this.ctx.logger.error(`[转发下发异常] source:${target} business:${businessMeta.clientKey}`, err)
          return { success: false, msg: '下发失败：' + err.message, data: null }
        }
      } else {
        // 当前本身就是业务通道，直接下发
        try {
          //【修改】使用带\r\n换行的sendFrame下发
          clientMeta.socket.write(Buffer.from(sendFrame))
          this.ctx.logger.info(`[TCP下发成功] ${target} SN:${clientMeta.sn} CID:${clientMeta.cid} 内容:${sendJson}`)
          writeSuccess = true;
        } catch (err) {
          this.ctx.logger.error(`[TCP下发异常] ${target}`, err)
          return { success: false, msg: '下发失败：' + err.message, data: null }
        }
      }
    } else {
      // 2. target是SN / CID，自动匹配该设备的business业务通道下发
      let businessMeta = null
      for (const dev of this.app.deviceMap.values()) {
        if (dev.sn === target || dev.cid === target) {
          businessMeta = this.app.tcpClients.get(dev.businessChannel)
          break
        }
      }

      if (!businessMeta || businessMeta.socket.destroyed) {
        return { success: false, msg: `未找到目标[${target}]对应的在线业务通道`, data: null }
      }

      try {
        //【修改】使用带\r\n换行的sendFrame下发
        businessMeta.socket.write(Buffer.from(sendFrame))
        this.ctx.logger.info(`[TCP自动匹配业务通道下发] target:${target} channel:${businessMeta.clientKey} SN:${businessMeta.sn} CID:${businessMeta.cid} 内容:${sendJson}`)
        writeSuccess = true;
      } catch (err) {
        this.ctx.logger.error(`[TCP自动下发异常] target:${target}`, err)
        return { success: false, msg: '下发失败：' + err.message, data: null }
      }
    }

    // 下发写入成功，开始等待设备5秒应答
    if (!writeSuccess) {
      return { success: false, msg: '指令写入socket失败', data: null };
    }
    try {
      const replyResult = await this.app.createWaitReplyTask(msgId, target);
      const replyData = replyResult.data;
      // 按code规范判断结果
      if (replyData.code === 1) {
        return {
          success: true,
          msg: '设备执行成功(code=1)',
          data: replyData
        };
      } else if (replyData.code === 0) {
        return {
          success: false,
          msg: '设备执行失败(code=0)',
          data: replyData
        };
      } else {
        return {
          success: false,
          msg: `设备返回未知code:${replyData.code}`,
          data: replyData
        };
      }
    } catch (err) {
      // 5秒超时，返回统一结构data
      return {
        success: false,
        msg: '指令下发成功，设备应答超时(code=-1)',
        data: {
          cmd: payload.cmd,
          msgId: msgId,
          code: -1
        }
      };
    }
  }

  getOnlineList() {
    const list = []
    for (const [clientKey, meta] of this.app.tcpClients.entries()) {
      list.push({
        clientKey,
        publicIp: meta.publicIp,
        sn: meta.sn,
        cid: meta.cid,
        type: meta.type,
      })
    }
    return list
  }
}

module.exports = TcpService