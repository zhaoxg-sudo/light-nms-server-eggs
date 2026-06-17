'use strict';

const Controller = require('egg').Controller;
const { Pool, Client } = require('pg')

class DeviceboxController extends Controller {
  // deviceacgetparam
  async getvafrombox() {
    // connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter getvafrombox", this.ctx.params)
      client.connect()
      let thisctx = this.ctx
      let catalogid = this.ctx.params.catalogid
      let ip
      let data = {}
      data.result = {}
      console.log(" box catalog id =", catalogid)
      let nodedata = await client.query('SELECT * from power_station_tree where catalogid =' + "'" + catalogid + "'")
      // console.log("return catalog data", nodedata)
      nodedata = nodedata.rows
      if (nodedata instanceof Array) {
        // console.log("return catalog rows", nodedata)
        let deviceip = nodedata[0].ipaddress
        ip = deviceip
        console.log("return device ip = ", deviceip)
        // ip = '192.168.1.200'
        let resultArr = [0x7d,0x01,0x17,0,0x04,0,0,0,0,0x99,0x0d];
        await this.ctx.service.powerbox.sendMsgPromiseTimeout('17',resultArr,ip)
          .then((e)=>{
            console.log("box getvafrombox:promise resolve 处理结束-----------------",e);
            let receiveMsg = e.msg
            let code = 1   
            data = {result:receiveMsg,code:code, catalogid: catalogid}
            thisctx.body = data 
          })
          .catch((e)=>{
            console.log("box getvafrombox:promise reject 处理超时？？？？？？？？？",e);
            let receiveMsg = '设备应答超时，读取数据失败？？'
            let code = -1
            data = {result:receiveMsg,code:code}
            thisctx.body = data 
            })
      } else {
          console.log("box getvafrombox:设备ID不存在？？？？？？？？？",e);
          let receiveMsg = '设备ID不存在？？'
          let code = -1
          data = {result:receiveMsg,code:code}
          thisctx.body = data 
      }
      // close db
     client.end()
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
      console.log("enter setoutportreboot", this.ctx.params)
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
        console.log("setoutportreboot return device ip = ", deviceip)
        // ip = '192.168.1.200'
        let resultArr = [0x7d,0x01,0x50,0x00,0x0a,0x01,0x6a,0x0f,0x4f,0xfc,0xb1,0x00,0x00,0x00,0x01,0x4f,0x0d];
        await this.ctx.service.powerbox.sendMsgPromiseTimeout('50',resultArr,ip)
          .then((e)=>{
            console.log("box setoutportreboot:promise resolve 处理结束-----------------",e);
            let receiveMsg = e.msg
            let code = 1   
            data = {result:receiveMsg,code:code, catalogid: catalogid}
            thisctx.body = data 
          })
          .catch((e)=>{
            console.log("box setoutportreboot:promise reject 处理超时？？？？？？？？？",e);
            let receiveMsg = '设备应答超时，读取数据失败？？'
            let code = -1
            data = {result:receiveMsg,code:code}
            thisctx.body = data 
            })
      } else {
          console.log("box setoutportreboot:设备ID不存在？？？？？？？？？",e);
          let receiveMsg = '设备ID不存在？？'
          let code = -1
          data = {result:receiveMsg,code:code}
          thisctx.body = data 
      }
      // close db
     client.end()
  }
}
module.exports = DeviceboxController;