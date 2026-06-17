'use strict';

const Controller = require('egg').Controller;
const { Pool, Client } = require('pg')

class DevicelocalController extends Controller {
  // deviceacgetparamfromagent
  async getparamfromagentac() {
    let catalogid = this.ctx.params.catalogid
    let thisctx = this.ctx
    console.log("getparamfromagentac--",catalogid);
    let e = await this.ctx.service.powerac.getacparamfromagent(catalogid)
    let receiveMsg = e
    let code = 1   
    let data = {result:receiveMsg,code:code, catalogid: catalogid}
    thisctx.body = data 
  }
  // deviceacgetparam
  async deviceacgetparam() {
    // connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter deviceacgetparam", this.ctx.params)
      client.connect()
      let thisctx = this.ctx
      let catalogid = this.ctx.params.catalogid
      let token = 0
      let sendArr = []
      let ip
      let data = {}
      data.result = {}
      console.log("catalog id =", catalogid)
      let nodedata = await client.query('SELECT * from power_station_tree where catalogid =' + "'" + catalogid + "'")
      // console.log("return catalog data", nodedata)
      if (nodedata.rows.length > 0) {
        // data.code = 1
        // data.result = nodedata.rows
        console.log("return catalog rows", nodedata.rows)
        let deviceip = nodedata.rows[0].ipaddress
        ip = deviceip
        console.log("return device ip = ", deviceip)
        // ip = '192.168.1.171'
        let resultArr = [1,4,0,1,0,0x2e,0x21,0xd6];
        await this.ctx.service.powerac.sendMsgPromiseTimeout(0x04,resultArr,ip)
                .then((e)=>{
                    console.log("deviceacgetparam:promise resolve 处理结束-----------------",e);
                    let receiveMsg = e.msg
                    let code = 1   
                    data = {result:receiveMsg,code:code, catalogid: catalogid}
                    thisctx.body = data 
                })
                .catch((e)=>{
                    console.log("deviceacgetparam:promise reject 处理超时？？？？？？？？？",e);
                    let receiveMsg = '设备应答超时，读取数据失败？？'
                    let code = -1
                    data = {result:receiveMsg,code:code}
                    thisctx.body = data 
                })
      }
      // close db
     client.end()
  }
}
module.exports = DevicelocalController;