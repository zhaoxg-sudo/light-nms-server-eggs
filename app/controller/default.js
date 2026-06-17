'use strict';

const Controller = require('egg').Controller;
const { Pool, Client } = require('pg')

class HomeController extends Controller {
  // get one default
  async defaultget() {
    //connect db
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    // the pool with emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    client.connect()
    console.log("enter defaultget router", this.ctx.params.catalogid)
    let catalogid = this.ctx.params.catalogid
    let  data = await client.query('SELECT * from power_default where catalogid =' + "'" + catalogid + "'")
      
    client.end()
    //end db
    const { ctx } = this;
    ctx.body = data.rows
  }
  
  // default update
  async defaultupdate() {
    // connect db
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    // the pool with emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    console.log("enter defaultpost router", this.ctx.request.body)
    let catalogid = this.ctx.request.body.catalogid
    let defaultshowenabled = this.ctx.request.body.defaultshowenabled
    let defaultshow = this.ctx.request.body.defaultshow
    let refreshtime = this.ctx.request.body.refreshtime
    let data = {}
    data.result = {}
    client.connect()
    let  result = await client.query("UPDATE power_default SET defaultshowenabled = " + "'" + defaultshowenabled + "'," + "defaultshow = "+ "'" + defaultshow + "'," +  "refreshtime = "+ "'" + refreshtime + "'" +" where catalogid = " + "'"+ catalogid +"'")  
    console.log("defaultpost return:=", result)
    if (result.rowCount === 1) {
      console.log('default update正确,catalogid =', catalogid)
      data.code = 1
      data.result = result
    } else {
        data.code = 0
        console.log('default update错误？？？？,catalogid =', catalogid)
    }
    client.end()
    // end db
    const { ctx } = this;
    ctx.body = data
  }
  // end default update
}
module.exports = HomeController;
