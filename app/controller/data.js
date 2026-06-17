'use strict';

const Controller = require('egg').Controller;
const { Pool, Client } = require('pg')


class DataController extends Controller {
  // get totol history alarm number
  async getalldatatotol() {
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
      
    let  data = await client.query('SELECT * from power_data_manage')
    client.end()
    //end db
    
    const { ctx } = this;
  
    console.log('data totol number = ', data.rows.length)
    ctx.body = data.rows.length
  }
  // get history alarm 页
  async postdatapage() {
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
    // 需要的数据
    let data = this.ctx.request.body;
    let startstamp = data.BeginTime;
    let endstamp = data.EndTime;
    console.log('get data  开始时间', startstamp)
    console.log('get data  结束时间', endstamp)
    // let total = data.total;
    let pageindex = data.pageIndex;
    let pagesize = data.pageSize;   
    let catalogid = data.catalogid
    let id = ''
    let datareturn
    let datatotal
    if (startstamp !=='') {
      if (catalogid !=='') {
        datatotal =  await client.query('SELECT * from power_data_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp + "'" + " and catalogid = " + "'" + catalogid + "'")
        datareturn = await client.query('SELECT * from power_data_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp + "'" + " and catalogid = " + "'" + catalogid + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }  else {
        datatotal =  await client.query('SELECT * from power_data_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp + "'")
        datareturn = await client.query('SELECT * from power_data_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp  + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }
    } 
    else {
      if (catalogid !=='') {
        datatotal =  await client.query('SELECT * from power_data_manage where catalogid =' + "'" + catalogid + "'")
        datareturn = await client.query('SELECT * from power_data_manage where catalogid = ' + "'" + catalogid + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }  else {
        datatotal = await client.query('SELECT * from power_data_manage where id >= ' + "'" +  id + "'")
        datareturn = await client.query('SELECT * from power_data_manage where id >= ' + "'" +  id + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }
    }
    client.end()
    //end db
    console.log('get data 页 记录', datareturn)
    const { ctx } = this
    let res = {total: 0, list: []}
    res.total = datatotal.rowCount
    res.list = datareturn.rows
    console.log('get data页 res', res)
    ctx.body = res 
  }
  // get history box 页
  async postboxpage() {
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
    // 需要的数据
    let data = this.ctx.request.body;
    let startstamp = data.BeginTime;
    let endstamp = data.EndTime;
    console.log('get box  开始时间', startstamp)
    console.log('get box  结束时间', endstamp)
    // let total = data.total;
    let pageindex = data.pageIndex;
    let pagesize = data.pageSize;   
    let catalogid = data.catalogid
    let id = ''
    let datareturn
    let datatotal
    if (startstamp !=='') {
      if (catalogid !=='') {
        datatotal =  await client.query('SELECT * from power_box_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp + "'" + " and catalogid = " + "'" + catalogid + "'")
        datareturn = await client.query('SELECT * from power_box_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp + "'" + " and catalogid = " + "'" + catalogid + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }  else {
        datatotal =  await client.query('SELECT * from power_box_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp + "'")
        datareturn = await client.query('SELECT * from power_box_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp  + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }
    } 
    else {
      if (catalogid !=='') {
        datatotal =  await client.query('SELECT * from power_box_manage where catalogid =' + "'" + catalogid + "'")
        datareturn = await client.query('SELECT * from power_box_manage where catalogid = ' + "'" + catalogid + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }  else {
        datatotal = await client.query('SELECT * from power_box_manage where id >= ' + "'" +  id + "'")
        datareturn = await client.query('SELECT * from power_box_manage where id >= ' + "'" +  id + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }
    }
    client.end()
    //end db
    console.log('get box 页 记录', datareturn)
    const { ctx } = this
    let res = {total: 0, list: []}
    res.total = datatotal.rowCount
    res.list = datareturn.rows
    console.log('get box页 res', res)
    ctx.body = res 
  }
  // get history clsd 页
  async postclsdpage() {
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
    // 需要的数据
    let data = this.ctx.request.body;
    let startstamp = data.BeginTime;
    let endstamp = data.EndTime;
    console.log('get clsd  开始时间', startstamp)
    console.log('get clsd  结束时间', endstamp)
    // let total = data.total;
    let pageindex = data.pageIndex;
    let pagesize = data.pageSize;   
    let catalogid = data.catalogid
    let id = ''
    let datareturn
    let datatotal
    if (startstamp !=='') {
      if (catalogid !=='') {
        datatotal =  await client.query('SELECT * from power_clsd_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp + "'" + " and catalogid = " + "'" + catalogid + "'")
        datareturn = await client.query('SELECT * from power_clsd_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp + "'" + " and catalogid = " + "'" + catalogid + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }  else {
        datatotal =  await client.query('SELECT * from power_clsd_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp + "'")
        datareturn = await client.query('SELECT * from power_clsd_manage where timestamp >=' + "'" +  startstamp + "'" + " and timestamp <= " + "'" + endstamp  + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }
    } 
    else {
      if (catalogid !=='') {
        datatotal =  await client.query('SELECT * from power_clsd_manage where catalogid =' + "'" + catalogid + "'")
        datareturn = await client.query('SELECT * from power_clsd_manage where catalogid = ' + "'" + catalogid + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }  else {
        datatotal = await client.query('SELECT * from power_clsd_manage where id >= ' + "'" +  id + "'")
        datareturn = await client.query('SELECT * from power_clsd_manage where id >= ' + "'" +  id + "'" + " order by timestamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }
    }
    client.end()
    //end db
    console.log('get clsd 页 记录', datareturn)
    const { ctx } = this
    let res = {total: 0, list: []}
    res.total = datatotal.rowCount
    res.list = datareturn.rows
    console.log('get clsd页 res', res)
    ctx.body = res 
  }
}
module.exports = DataController;
