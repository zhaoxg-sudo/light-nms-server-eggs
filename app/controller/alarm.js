'use strict';

const Controller = require('egg').Controller;
const { Pool, Client } = require('pg')


class HomeController extends Controller {
  // alarm fired insert
  async postalarmfiredinsert() {
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
    let request = this.ctx.request.body;
    console.log('postalarmfiredinsert', request)
    let alarmid = request.alarmid
    let alarmstation = request.alarmstation
    let alarmmudid = request.alarmmudid
    let alarmreceivedtime = request.alarmreceivedtime
    let alarmfiredtime = request.alarmfiredtime
    let alarmdetail = request.alarmdetail
    let alarmreason = request.alarmreason
    let alarmlevel = request.alarmlevel
    let alarmconfirmedflag = request.alarmconfirmedflag
    let alarmconfirmedtime = request.alarmconfirmedtime
    let alarmconfirmedinfo = request.alarmconfirmedinfo
    let alarmrestoreflag = request.alarmrestoreflag
    let alarmrestoreinfo = request.alarmrestoreinfo
    let alarmsourceip = request.alarmsourceip
    let alarmaddition = request.alarmaddition
    console.log('postalarmfiredinsert', request)
    let insertSql = "insert into power_alarm_current (alarmid,alarmstation,alarmmudid,alarmreceivedtime,alarmfiredtime,alarmdetail,alarmreason,alarmlevel,alarmconfirmedflag,alarmconfirmedtime,alarmconfirmedinfo,alarmrestoreflag,alarmrestoreinfo,alarmsourceip,alarmaddition) \
    values ("+ "'"+alarmid+"'"+",\
            "+ "'"+alarmstation+"'"+",\
            "+ "'"+alarmmudid+"'"+",\
            "+ "'"+alarmreceivedtime+"'"+",\
            "+ "'"+alarmfiredtime+"'"+",\
            "+ "'"+alarmdetail+"'"+",\
            "+ "'"+alarmreason+"'"+",\
            "+ "'"+alarmlevel+"'"+",\
            "+ "'"+alarmconfirmedflag+"'"+",\
            "+ "'"+alarmconfirmedtime+"'"+",\
            "+ "'"+alarmconfirmedinfo+"'"+",\
            "+ "'"+alarmrestoreflag+"'"+",\
            "+ "'"+alarmrestoreinfo+"'"+",\
            "+ "'"+alarmsourceip+"'"+",\
            "+ "'"+alarmaddition+"'"+")";
    console.log(insertSql);
    let data = await client.query(insertSql);
    if (data)
      console.log("---db服务，新增alarm数据库记录：",request); 
      else console.log("---db服务，新增alarm数据库记录失败？？？？？？？：",request); 
    client.end()
    //end db
    
    const { ctx } = this;
    ctx.body = data
  }
  // alarm fired
  async postalarmfiredcheck() {
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
    let request = this.ctx.request.body;
    let alarmdetail = request.alarmdetail
    let alarmmudid = request.alarmmudid
    console.log('postalarmfiredcheck', request)
    let  data = await client.query('SELECT * from power_alarm_current where alarmdetail =' + "'" +  alarmdetail + "'" + " and alarmmudid = " + "'" + alarmmudid + "'")
    client.end()
    //end db
    
    const { ctx } = this;
    //ctx.body = 'hi, egg';
    ctx.body = data.rows
  }
  // current alarm del
  async postcurrentalarmdel() {
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
    // 需要修改的数据
    let request = this.ctx.request.body;
    let alarmid = request.alarmid;
    let data = await client.query('DELETE from power_alarm_current where alarmid =' + "'" + alarmid + "'")
    client.end()
    //end db
    console.log('postcurrentalarmdel=', data)
    const { ctx } = this;
    //ctx.body = 'hi, egg';
    ctx.body = data.rows
  }
  // get current alarm one
  async getcurrentalarm() {
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
      console.log("enter getcurrentalarm", this.ctx.params)
      let alarmid = this.ctx.params.alarmid
      console.log("current alarm  alarmid=", alarmid)
      let  data = await client.query('SELECT * from power_alarm_current where alarmid =' + "'" +  alarmid + "'")
      client.end()
    //end db
    
    const { ctx } = this;
    //ctx.body = 'hi, egg';
    ctx.body = data.rows
  }
  // get all current alarm
  async getallcurrentalarm() {
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
      // let pageindex = 1;
      // let pagesize = 5;   
      let  data = await client.query('SELECT * from power_alarm_current')
      client.end()
    //end db
    
    const { ctx } = this;
    //ctx.body = 'hi, egg';
    ctx.body = data.rows
  }
  // get totol number
  async getallcurrentalarmtotol() {
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
     
      let  data = await client.query('SELECT * from power_alarm_current')
      
      client.end()
    //end db
    
    const { ctx } = this;
  
    console.log('current alarm totol number = ', data.rows.length)
    ctx.body = data.rows.length
  }
  // get 页
  async postpagecurrentalarm() {
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
    // let total = data.total;
    let pageindex = data.pageIndex;
    let pagesize = data.pageSize;   
    let  datareturn = await client.query('SELECT * from power_alarm_current' + " order by alarmreceivedtime desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      
    client.end()
    //end db
    console.log('get current alarm 页', datareturn.rows)
    const { ctx } = this;
    //ctx.body = 'hi, egg';
    ctx.body = datareturn.rows
  }
  // postcurrentalarmupdate
  async postcurrentalarmupdate() {
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
    // 需要修改的数据
    let request = this.ctx.request.body;
    let alarmid = request.alarmid;
    let alarmconfirmedflag = request.alarmconfirmedflag;
    let alarmconfirmedtime = request.alarmconfirmedtime;
    let alarmconfirmedinfo = request.alarmconfirmedinfo;   
    let datareturn = await client.query("UPDATE power_alarm_current SET alarmconfirmedflag = " + "'" + alarmconfirmedflag + "'," + "alarmconfirmedtime = "+ "'" + alarmconfirmedtime + "'," +  "alarmconfirmedinfo = "+ "'" + alarmconfirmedinfo + "'" +" where alarmid = " + "'"+ alarmid +"'")
    client.end()
    //end db
    console.log('postcurrentalarmupdate', datareturn)
    const { ctx } = this;
    //ctx.body = 'hi, egg';
    ctx.body = datareturn.rows
  }
  // get历史告警
  async getallhistoryalarm() {
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
         
      let  data = await client.query('SELECT * from power_alarm_history')
      
      client.end()
    //end db
    
    const { ctx } = this;
    //ctx.body = 'hi, egg';
    ctx.body = data.rows
  }
  // get totol history alarm number
  async getallhistoryalarmtotol() {
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
      
      let  data = await client.query('SELECT * from power_alarm_history')
      client.end()
    //end db
    
    const { ctx } = this;
  
    console.log('history alarm totol number = ', data.rows.length)
    ctx.body = data.rows.length
  }
  // get history alarm 页
  async postpagehistoryalarm() {
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
    console.log('get history alarm 开始时间', startstamp)
    console.log('get history alarm 结束时间', endstamp)
    // let total = data.total;
    let pageindex = data.pageIndex;
    let pagesize = data.pageSize;
    let station = data.station   
    // let station = ''
    let datareturn
    let datatotal

    if (startstamp !=='') {
      if (station !=='') {
        datatotal =  await client.query('SELECT * from  power_alarm_history where alarmfiredtime >=' + "'" +  startstamp + "'" + " and alarmfiredtime <= " + "'" + endstamp + "'" + " and alarmmudid = " + "'" + station + "'")
        datareturn = await client.query('SELECT * from  power_alarm_history where alarmfiredtime >=' + "'" +  startstamp + "'" + " and alarmfiredtime <= " + "'" + endstamp + "'" + " and alarmmudid = " + "'" + station + "'" + " order by alarmfiredtime desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }  else {
        datatotal =  await client.query('SELECT * from  power_alarm_history where alarmfiredtime >=' + "'" +  startstamp + "'" + " and alarmfiredtime <= " + "'" + endstamp + "'")
        datareturn = await client.query('SELECT * from  power_alarm_history where alarmfiredtime >=' + "'" +  startstamp + "'" + " and alarmfiredtime <= " + "'" + endstamp  + "'" + " order by alarmfiredtime desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }
    } 
    else {
      if (station !=='') {
        datatotal =  await client.query('SELECT * from  power_alarm_history where alarmmudid =' + "'" + station + "'")
        datareturn = await client.query('SELECT * from  power_alarm_history where alarmmudid = ' + "'" + station + "'" + " order by alarmfiredtime desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }  else {
        datatotal = await client.query('SELECT * from  power_alarm_history where alarmmudid >= ' + "'" +  station + "'")
        datareturn = await client.query('SELECT * from  power_alarm_history where alarmmudid >= ' + "'" +  station + "'" + " order by alarmfiredtime desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
      }
    }

    // if (startstamp !=='') {
    //   datatotal = await client.query('SELECT * from power_alarm_history where alarmfiredtime >=' + "'" +  startstamp + "'" + " and alarmfiredtime <= " + "'" + endstamp + "'")
    //   datareturn = await client.query('SELECT * from power_alarm_history where alarmfiredtime >=' + "'" +  startstamp + "'" + " and alarmfiredtime <= " + "'" + endstamp  + "'" + " order by alarmfiredtime desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
    // } else {
    //   datatotal = await client.query('SELECT * from power_alarm_history where alarmid >= ' + "'" +  station + "'")
    //   datareturn = await client.query('SELECT * from power_alarm_history where alarmid >= ' + "'" +  station + "'" + " order by alarmfiredtime desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize)
    // }
    client.end()
    //end db
    console.log('get history alarm 页 记录', datareturn.rows)
    const { ctx } = this
    let res = {total: 0, list: []}
    res.total = datatotal.rowCount
    res.list = datareturn.rows
    console.log('get history alarm 页 res', res)
    ctx.body = res 
  }
  // posthistoryalarmupdate
  async posthistoryalarmupdate() {
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
    // 需要修改的数据
    let request = this.ctx.request.body;
    let alarmid = request.alarmid;
    let alarmconfirmedflag = request.alarmconfirmedflag;
    let alarmconfirmedtime = request.alarmconfirmedtime;
    let alarmconfirmedinfo = request.alarmconfirmedinfo;   
    let data = await client.query("UPDATE power_alarm_history SET alarmconfirmedflag = " + "'" + alarmconfirmedflag + "'," + "alarmconfirmedtime = "+ "'" + alarmconfirmedtime + "'," +  "alarmconfirmedinfo = "+ "'" + alarmconfirmedinfo + "'" +" where alarmid = " + "'"+ alarmid +"'")
    client.end()
    //end db
    console.log('posthistoryalarmupdate', data)
    const { ctx } = this;
    ctx.body = data.rows
  }
    // insert to 历史告警
    async inserttohistoryalarm() {
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
      let insertTable = this.ctx.request.body;  
      console.log("---db，新增history alarm数据库记录：",insertTable); 
      let insertSql = "insert into power_alarm_history (alarmid,alarmstation,alarmmudid,alarmreceivedtime,alarmfiredtime,alarmdetail,alarmreason,alarmlevel,alarmconfirmedflag,alarmconfirmedtime,alarmconfirmedinfo,alarmrestoreflag,alarmrestoreinfo,alarmsourceip,alarmaddition) \
        values ("+ "'"+insertTable.alarmid+"'"+",\
                "+ "'"+insertTable.alarmstation+"'"+",\
                "+ "'"+insertTable.alarmmudid+"'"+",\
                "+ "'"+insertTable.alarmreceivedtime+"'"+",\
                "+ "'"+insertTable.alarmfiredtime+"'"+",\
                "+ "'"+insertTable.alarmdetail+"'"+",\
                "+ "'"+insertTable.alarmreason+"'"+",\
                "+ "'"+insertTable.alarmlevel+"'"+",\
                "+ "'"+insertTable.alarmconfirmedflag+"'"+",\
                "+ "'"+insertTable.alarmconfirmedtime+"'"+",\
                "+ "'"+insertTable.alarmconfirmedinfo+"'"+",\
                "+ "'"+insertTable.alarmrestoreflag+"'"+",\
                "+ "'"+insertTable.alarmrestoreinfo+"'"+",\
                "+ "'"+insertTable.alarmsourceip+"'"+",\
                "+ "'"+insertTable.alarmaddition+"'"+")";
        console.log(insertSql);
        let insertErr = await client.query(insertSql);
        if (insertErr)
          console.log("---db服务，新增history alarm数据库记录：",insertTable); 
          else console.log("---db服务，新增alarm历史数据库记录失败？？？？？？？：",insertTable); 
        
      client.end()
      //end db
      
      const { ctx } = this;
      //ctx.body = 'hi, egg';
      ctx.body = insertErr
    }
}
module.exports = HomeController;
