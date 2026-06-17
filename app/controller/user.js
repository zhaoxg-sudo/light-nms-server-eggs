'use strict';

const Controller = require('egg').Controller;
const { Pool, Client } = require('pg')


class HomeController extends Controller {
  // get all users
  async userall() {
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
         
      let  data = await client.query('SELECT * from power_user')
      
      client.end()
    //end db
    
    const { ctx } = this;
    //ctx.body = 'hi, egg';
    ctx.body = data.rows
  }
  
  // user login 
  async userlogin() {
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
    console.log("enter userlogin router", this.ctx.request.body)
      let userid = this.ctx.request.body.account
      let password = this.ctx.request.body.password
      let data = {}
      data.result = {}
      client.connect()
      
      let  result = await client.query("SELECT * from power_user where username =" + "'" + userid + "'" + " and password = " + "'" + password + "'")   
      if (result.rows.length > 0) {
        console.log('用户名/密码正确,username =', userid)
        data.code = 1
        data.result = result.rows
      } else {
          data.code = 0
          console.log('用户名/密码错误？？？？,login =', userid + password)
      }
      client.end()
    // end db
    
    const { ctx } = this;
    
    ctx.body = data
  }
  // end user login
  // get user by orgid
  async userbyorgid() {
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
    console.log("enter userbyorgid router", this.ctx.params.orgid)
      let userorg = this.ctx.params.orgid
      let data = {}
      data.result = {}
      client.connect()
      
      let  result = await client.query("SELECT * from power_user where userorg =" + "'" + userorg + "'" )   
      if (result.rows.length > 0) {
        console.log('userbyorgid：获取到该组织的所有用户,orgid =', userorg)
        data.code = 1
        data.result = result.rows
      } else {
          data.code = 0
          console.log('userbyorgid：没有记录？？？？,orgid =', userorg)
      }
      client.end()
    // end db
    
    const { ctx } = this;
    
    ctx.body = data
  }
  // end get user by orgid
  // create user
  async useradd() {
    //connect db
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    console.log("enter useradd router", this.ctx.request.body)
    client.connect()
    let formData = this.ctx.request.body
    let userid = formData.userId
    let username = formData.userName
    let password = formData.password
    let usertype = formData.type
    let userorg = formData.userOrg
    let userpowered = formData.loginId
    let userright = ''
    let userphoto = ''
    let useradd = ''
    let createdat = ''
    let updatedat = ''
    let disabled = false
    let sortindex = 0
    let date = new Date()
    let year = date.getFullYear() 
    let month =  date.getMonth()+1 
    let day = date.getDate()
    let hour =  date.getHours() 
    let minute = date.getMinutes()
    let second = date.getSeconds()
    let time = year + '-' + String(month >9?month:("0"+month)) + '-' + String(day >9?day:("0"+day)) + ' ' +  String(hour >9?hour:("0"+hour)) + ':' + String(minute >9?minute:("0"+minute)) + ':' + String(second >9?second:("0"+second)) 
    console.log('当前时间获取：====', time)
    
    createdat = time
    updatedat = time
    console.log("userid=", userid)
    let data = {}
    data.result = {}
    let alreay_exist = await client.query('SELECT * from power_user where username  =' + "'" + username + "'")
    if (alreay_exist.rows.length > 0) {
      console.log('数据库中已经有该用户，添加用户失败????,username =', username)
      data.code = 0
      data.result ="用户已存在，userid =" + userid
    } else {
      await client.query('INSERT INTO power_user (userid,username,password,usertype,userorg,userpowered,userright,userphoto,useradd,createdat,updatedat,disabled,sortindex) VALUES (' + 
            "'" + userid + "'" + ","+
            "'" + username +"'"+","+
            "'" + password +"'"+","+
            "'" + usertype +"'"+","+
            "'" + userorg +"'"+","+
            "'" + userpowered +"'"+","+
            "'" + userright +"'"+","+
            "'" + userphoto + "'" + ","+
            "'" + useradd +"'"+","+
            "'" + createdat +"'"+","+
            "'" + updatedat +"'"+","+
            "'" + disabled +"'"+","+
            "'" + sortindex +"')")
            console.log('数据库中没有该用户，添加用户成功！！！！，新增节点的userid =', userid)
      data.code = 1
      data.result = {userid:userid, username:username, password:password, userorg:userorg, userpowered:userpowered, userright:userright, userphoto:userphoto, useradd:useradd, createdat:createdat, updatedat:updatedat, disabled:disabled, sortindex:sortindex}
    }
    client.end()
    this.ctx.body = data
  }
  // update user
  async useredit() {
    //connect db
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    console.log("enter treedelnode router", this.ctx.request.body)
    client.connect()
    let catalogid = this.ctx.request.body
    console.log("catalogid=", catalogid)
    let data = {}
    data.result = []
    for (let i = 0; i < catalogid.length; i++ ) {
      let order = await client.query('DELETE from power_station_tree where catalogid =' + "'" + catalogid[i] + "'")
      console.log(order)
      if (order.rowCount > 0) {
      console.log('数据库中树节点删除成功,catalogid =', catalogid[i])
      data.code = 1
      data.result.push("树节点删除成功，catalogid =" + catalogid[i])
      } else {
        console.log('数据库中树节点删除失败,catalogid =', catalogid[i])
        data.code = 1
        data.result.push("树节点删除失败，catalogid =" + catalogid[i])
      }
    }
    client.end()
    this.ctx.body = data
  }
  // del user
  async userdel() {
    //connect db
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    console.log("enter userdel router", this.ctx.request.body)
    client.connect()
    let username = this.ctx.request.body.username
    console.log("username=", username)
    let data = {}
    data.result = []
      let order = await client.query('DELETE from power_user where username =' + "'" + username + "'")
      // console.log(order)
      if (order.rowCount > 0) {
      console.log('数据库中用户删除成功,username =', username)
      data.code = 1
      data.result.push("用户删除成功，username =" + username)
      } else {
        console.log('数据库中用户删除失败,username =', username)
        data.code = 0
        data.result.push("用户删除失败，username =" + username)
      }
    client.end()
    this.ctx.body = data
  }
}

module.exports = HomeController;
