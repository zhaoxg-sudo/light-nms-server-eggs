'use strict'
const { Service } = require('egg')

class TcpService extends Service {
  /**
   * 下发TCP指令
   * @param {string} target clientKey / SN / CID
   * @param {string} content JSON字符串指令
   */
  send(target, content) {
    // 1. 传入 clientKey（带冒号）
    if (target.includes(':')) {
      const clientMeta = this.app.tcpClients.get(target)
      if (!clientMeta || clientMeta.socket.destroyed) {
        return { success: false, msg: '设备通道不在线' }
      }

      // 如果当前是GPS通道，自动找同设备业务通道下发
      if (clientMeta.type !== 'business') {
        const devInfo = this.app.deviceMap.get(clientMeta.sn)
        if (!devInfo || !devInfo.businessChannel) {
          return { success: false, msg: '该GPS通道无配套在线业务通道' }
        }
        const businessMeta = this.app.tcpClients.get(devInfo.businessChannel)
        if (!businessMeta || businessMeta.socket.destroyed) {
          return { success: false, msg: '配套业务通道已离线' }
        }
        try {
          businessMeta.socket.write(Buffer.from(content))
          this.ctx.logger.info(`[GPS通道自动转发业务通道] source:${target} realSend:${businessMeta.clientKey} SN:${businessMeta.sn} CID:${businessMeta.cid} 内容:${content}`)
          return { success: true, msg: '指令下发成功，已自动转发至业务通道' }
        } catch (err) {
          this.ctx.logger.error(`[转发下发异常] source:${target} business:${businessMeta.clientKey}`, err)
          return { success: false, msg: '下发失败：' + err.message }
        }
      }

      // 当前本身就是业务通道，直接下发
      try {
        clientMeta.socket.write(Buffer.from(content))
        this.ctx.logger.info(`[TCP下发成功] ${target} SN:${clientMeta.sn} CID:${clientMeta.cid} 内容:${content}`)
        return { success: true, msg: '指令下发成功' }
      } catch (err) {
        this.ctx.logger.error(`[TCP下发异常] ${target}`, err)
        return { success: false, msg: '下发失败：' + err.message }
      }
    }

    // 2. target是SN / CID，自动匹配该设备的business业务通道下发
    let businessMeta = null
    for (const dev of this.app.deviceMap.values()) {
      if (dev.sn === target || dev.cid === target) {
        businessMeta = this.app.tcpClients.get(dev.businessChannel)
        break
      }
    }

    if (!businessMeta || businessMeta.socket.destroyed) {
      return { success: false, msg: `未找到目标[${target}]对应的在线业务通道` }
    }

    try {
      businessMeta.socket.write(Buffer.from(content))
      this.ctx.logger.info(`[TCP自动匹配业务通道下发] target:${target} channel:${businessMeta.clientKey} SN:${businessMeta.sn} CID:${businessMeta.cid} 内容:${content}`)
      return { success: true, msg: '指令下发成功（自动匹配业务通道）' }
    } catch (err) {
      this.ctx.logger.error(`[TCP自动下发异常] target:${target}`, err)
      return { success: false, msg: '下发失败：' + err.message }
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