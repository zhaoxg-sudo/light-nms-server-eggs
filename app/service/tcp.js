'use strict'
const { Service } = require('egg')

class TcpService extends Service {
  send(clientKey, content) {
    const socket = this.app.tcpClients.get(clientKey)
    if (!socket || socket.destroyed) return { success: false, msg: '设备不在线' }

    try {
      socket.write(Buffer.from(content))
      return { success: true, msg: '指令下发成功' }
    } catch (err) {
      return { success: false, msg: '下发失败：' + err.message }
    }
  }

  getOnlineList() {
    return Array.from(this.app.tcpClients.keys())
  }
}

module.exports = TcpService