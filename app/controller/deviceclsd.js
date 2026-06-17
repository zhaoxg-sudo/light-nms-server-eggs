'use strict';

const Controller = require('egg').Controller;
const { Pool, Client } = require('pg')

class DeviceclsdController extends Controller {
  // getparamsfromclsd
  async getparamsfromclsd() {
    let catalogid = this.ctx.params.catalogid
    let thisctx = this.ctx
    console.log("getparamsfromclsd--",catalogid);
    let e = await this.ctx.service.powerclsd.getclsdparamfromagent(catalogid)
    let receiveMsg = e
    let code = 1   
    let data = {result:receiveMsg,code:code, catalogid: catalogid}
    thisctx.body = data 
  }
  // getuplaodall
  async getuploadport() {
    // connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter getuploadport", this.ctx.params)
      client.connect()
      let thisctx = this.ctx
      let catalogid = this.ctx.params.catalogid
      let ip
      let data = {}
      data.result = {}
      console.log(" box catalog id =", catalogid)
      let nodedata = await client.query('SELECT * from power_station_tree where catalogid =' + "'" + catalogid + "'")
      // console.log("getuploadport return catalog data", nodedata)
      nodedata = nodedata.rows
      if (nodedata instanceof Array) {
        // console.log("getuploadport return catalog rows", nodedata)
        let deviceip = nodedata[0].ipaddress
        ip = deviceip
        console.log("getuploadport return device ip = ", deviceip)
        // ip = '192.168.1.200'
        let resultArr = [0x7d,0x01,0xf0,0,0x04,0,0,0,0,0x72,0x0d];
        await this.ctx.service.powerbox.sendMsgPromiseTimeout('f1',resultArr,ip)
          .then((e)=>{
            console.log("box getuploadport:promise resolve 处理结束-----------------",e);
            let receiveMsg = e.msg
            let code = 1   
            data = {result:receiveMsg,code:code, catalogid: catalogid}
            thisctx.body = data 
          })
          .catch((e)=>{
            console.log("box getuploadport:promise reject 处理超时？？？？？？？？？",e);
            let receiveMsg = '设备应答超时，读取数据失败？？'
            let code = -1
            data = {result:receiveMsg,code:code}
            thisctx.body = data 
            })
      } else {
          console.log("box getuploadport:设备ID不存在？？？？？？？？？",e);
          let receiveMsg = '设备ID不存在？？'
          let code = -1
          data = {result:receiveMsg,code:code}
          thisctx.body = data 
      }
      // close db
     client.end()
  }
  // setoutporton
  async setoutporton() {
    // connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter setoutporton", this.ctx.params)
      client.connect()
      let thisctx = this.ctx
      let catalogid = this.ctx.params.catalogid
      let port = this.ctx.params.port
      let token = 0
      let sendArr = []
      let ip
      let data = {}
      data.result = {}
      console.log(" box catalog id =", catalogid)
      let nodedata = await client.query('SELECT * from power_station_tree where catalogid =' + "'" + catalogid + "'")
      // console.log("setoutportreboot return catalog data", nodedata)
      nodedata = nodedata.rows
      if (nodedata instanceof Array) {
        // console.log("setoutportreboot return catalog rows", nodedata)
        let deviceip = nodedata[0].ipaddress
        ip = deviceip
        console.log("setoutporton return device ip = ", deviceip)
        // ip = '192.168.1.200'
        let resultArr = [0x7d,0x01,0x52,0x00,0x0a,0x01,0x6a,0x0f,0x4f,0xfc,0xc2,0x00,0x00,0x00,0x01,0x62,0x0d];
        await this.ctx.service.powerbox.sendMsgPromiseTimeout('52',resultArr,ip)
          .then((e)=>{
            console.log("box setoutporton:promise resolve 处理结束-----------------",e);
            let receiveMsg = e.msg
            let code = 1   
            data = {result:receiveMsg,code:code, catalogid: catalogid}
            thisctx.body = data 
          })
          .catch((e)=>{
            console.log("box setoutporton:promise reject 处理超时？？？？？？？？？",e);
            let receiveMsg = '设备应答超时，读取数据失败？？'
            let code = -1
            data = {result:receiveMsg,code:code}
            thisctx.body = data 
            })
      } else {
          console.log("box setoutporton:设备ID不存在？？？？？？？？？",e);
          let receiveMsg = '设备ID不存在？？'
          let code = -1
          data = {result:receiveMsg,code:code}
          thisctx.body = data 
      }
      // close db
     client.end()
  }
  // setoutportoff
  async setoutportoff() {
    // connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter setoutportoff", this.ctx.params)
      client.connect()
      let thisctx = this.ctx
      let catalogid = this.ctx.params.catalogid
      let port = this.ctx.params.port
      let token = 0
      let sendArr = []
      let ip
      let data = {}
      data.result = {}
      console.log(" box catalog id =", catalogid)
      // 切断01端口
      let nodedata = await client.query('SELECT * from power_station_tree where catalogid =' + "'" + catalogid + "'")
      // console.log("setoutportreboot return catalog data", nodedata)
      nodedata = nodedata.rows
      if (nodedata instanceof Array) {
        // console.log("setoutportreboot return catalog rows", nodedata)
        let deviceip = nodedata[0].ipaddress
        ip = deviceip
        console.log("setoutportoff return device ip = ", deviceip)
        // ip = '192.168.1.200'
        let resultArr = [0x7d,0x01,0x51,0,0x0a,0x01,0x6a,0x0f,0x4f,0xfc,0xb1,0x00,0x00,0x00,0x01,0x50,0x0d];
        await this.ctx.service.powerbox.sendMsgPromiseTimeout('51',resultArr,ip)
          .then((e)=>{
            console.log("box setoutportoff:promise resolve 处理结束-----------------",e);
            let receiveMsg = e.msg
            let code = 1   
            data = {result:receiveMsg,code:code, catalogid: catalogid}
            thisctx.body = data 
          })
          .catch((e)=>{
            console.log("box setoutportoff:promise reject 处理超时？？？？？？？？？",e);
            let receiveMsg = '设备应答超时，读取数据失败？？'
            let code = -1
            data = {result:receiveMsg,code:code}
            thisctx.body = data 
            })
      } else {
          console.log("box setoutportoff:设备ID不存在？？？？？？？？？",e);
          let receiveMsg = '设备ID不存在？？'
          let code = -1
          data = {result:receiveMsg,code:code}
          thisctx.body = data 
      }
      // close db
     client.end()
  }
  // setoutportreboot
  async setoutportreboot() {
    // connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter clsd setoutportreboot", this.ctx.params)
      client.connect()
      let thisctx = this.ctx
      let catalogid = this.ctx.params.catalogid
      let port = this.ctx.params.port
      let token = 0
      let ip
      let data = {}
      data.result = {}
      console.log(" clsd catalog id =", catalogid)
      let nodedata = await client.query('SELECT * from power_station_tree where catalogid =' + "'" + catalogid + "'")
      // console.log("setoutportreboot return catalog data", nodedata)
      nodedata = nodedata.rows
      if (nodedata instanceof Array) {
        // console.log("setoutportreboot return catalog rows", nodedata)
        let deviceip = nodedata[0].ipaddress
        ip = deviceip
        // ip = '192.168.1.200'
        let resultArr = [];
        switch (port) {
          case '00':
            resultArr = [0x01,0x05,0x00,0x47,0x00,0x00,0x7D,0xDF]
            break;
          case '06':
            resultArr = [0x01,0x05,0x00,0x45,0x00,0x00,0xDC,0x1F]
            break;
          case '05':
            resultArr = [0x01,0x05,0x00,0x44,0x00,0x00,0x8D,0xDF]
            break;
          case '04':
            resultArr = [0x01,0x05,0x00,0x43,0x00,0x00,0x3C,0x1E]
            break;
          case '03':
            resultArr = [0x01,0x05,0x00,0x42,0x00,0x00,0x6D,0xDE]
            break;
          case '02':
            resultArr = [0x01,0x05,0x00,0x41,0x00,0x00,0x9D,0xDE]
            break;
          case '01':
            resultArr = [0x01,0x05,0x00,0x40,0x00,0x00,0xCC,0x1E]
            break;
        }
        console.log("setoutportreboot return device ip, port,resultArr= ", deviceip, port, resultArr)
        await this.ctx.service.powerclsd.sendMsgPromiseTimeout('05',resultArr,ip)
          .then((e)=>{
            console.log("clsd setoutportreboot:promise resolve 处理结束-----------------",e);
            let receiveMsg = e.msg
            let code = 1   
            data = {result:receiveMsg,code:code, catalogid: catalogid}
            thisctx.body = data 
          })
          .catch((e)=>{
            console.log("clsd setoutportreboot:promise reject 处理超时？？？？？？？？？",e);
            let receiveMsg = '设备应答超时，读取数据失败？？'
            let code = -1
            data = {result:receiveMsg,code:code}
            thisctx.body = data 
            })
      } else {
          console.log("clsd setoutportreboot:设备ID不存在？？？？？？？？？",e);
          let receiveMsg = '设备ID不存在？？'
          let code = -1
          data = {result:receiveMsg,code:code}
          thisctx.body = data 
      }
      // close db
     client.end()
  }
}
module.exports = DeviceclsdController;