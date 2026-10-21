'use strict'
const { Controller } = require('egg')

class TcpController extends Controller {
  async send() {
    const { clientKey, content } = this.ctx.request.body
    this.ctx.logger.info('[TCP controller] 收到send指令：' + clientKey + ',指令内容:' + content)
    if (!clientKey || !content) {
      return this.ctx.body = { success: false, msg: '参数缺失：clientKey、content' }
    }
    this.ctx.body = await this.ctx.service.tcp.send(clientKey, content)
  }

  async tcpclient() {
    const list = await this.ctx.service.tcp.getTcpClientList()
    this.ctx.body = { success: true, list }
  }

  async devicelist() {
    const list = await this.ctx.service.tcp.getDeviceList()
    this.ctx.body = { success: true, list }
  }
}

module.exports = TcpController