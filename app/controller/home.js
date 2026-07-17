'use strict';

const Controller = require('egg').Controller;
const { Pool, Client } = require('pg')


class HomeController extends Controller {
  // get all node
  async index() {
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
         
      let  data = await client.query('SELECT * from power_station_tree')
      
      client.end()
    //end db
    
    const { ctx } = this;
    //ctx.body = 'hi, egg';
    ctx.body = data.rows
  }
  // get all children of this node
  async childrenall() {
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
    // console.log("enter childrenall router", this.ctx.params)
    client.connect()
    let catalogid = this.ctx.params.catalogid
    let  data = await client.query('SELECT * from power_station_tree where parentid =' + "'" + catalogid + "'")   
    client.end()
    //end db
    // console.log("enter childrenall router->return", data)
    const { ctx } = this;
    //ctx.body = 'hi, egg';
    ctx.body = data.rows
  }
  async treeaddnode() {
    //connect db
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    console.log("enter treeaddnode router", this.ctx.request.body)
    client.connect()
    let catalogid = this.ctx.request.body.catalogid
    let parentid = this.ctx.request.body.parentid
    let label = this.ctx.request.body.label
    let stationtype = this.ctx.request.body.stationtype
    let commtype = this.ctx.request.body.commtype
    let protocoltype = this.ctx.request.body.protocoltype
    let positioninfo = this.ctx.request.body.positioninfo
    let addinfo = this.ctx.request.body.addinfo
    let ipaddress = this.ctx.request.body.ipaddress
    let ipport = this.ctx.request.body.ipport
    let childrennum = this.ctx.request.body.childrennum
    let gpslng = this.ctx.request.body.gpslng
    let gpslat = this.ctx.request.body.gpslat
    let gcjlng = this.ctx.request.body.gcjlng
    let gcjlat = this.ctx.request.body.gcjlat

    console.log("catalogid=", catalogid)
    let data = {}
    data.result = {}
    let alreay_exist = await client.query('SELECT * from power_station_tree where catalogid =' + "'" + catalogid + "'")
    if (alreay_exist.rows.length > 0) {
      console.log('数据库中已经有该节点，添加树节点失败????,catalogid =', catalogid)
      data.code = 2
      data.result ="树节点已存在，catalogid =" + catalogid
    } else {
      await client.query('INSERT INTO power_station_tree (catalogid,parentid,label,stationtype,commtype,protocoltype,positioninfo,addinfo,ipaddress,ipport,childrennum,gpslng,gpslat,gcjlng,gcjlat) VALUES (' + 
            "'" + catalogid + "'" + ","+
            "'" + parentid +"'"+","+
            "'" + label +"'"+","+
            "'" + stationtype +"'"+","+
            "'" + commtype +"'"+","+
            "'" + protocoltype +"'"+","+
            "'" + positioninfo + "'" + ","+
            "'" + addinfo +"'"+","+
            "'" + ipaddress +"'"+","+
            "'" + ipport +"'"+","+
            "'" + childrennum + "'" + ","+
            "'" + gpslng +"'"+","+
            "'" + gpslat +"'"+","+
            "'" + gcjlng +"'"+","+
            "'" + gcjlat +"')")
            console.log('数据库中没有该节点，添加树节点成功！！！！，新增节点的catalogid =', catalogid)
      data.code = 1
      data.result = {catalogid:catalogid, parentid:parentid, label:label, stationtype:stationtype, commtype:commtype, protocoltype:protocoltype, positioninfo:positioninfo, addinfo:addinfo, ipaddress:ipaddress, ipport:ipport, childrennum:childrennum, gpslng:gpslng, gpslat:gpslat, gcjlng:gcjlng, gcjlat:gcjlat}
    }
    client.end()
    this.ctx.body = data
  }
  // del node
  async treedelnode() {
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
        data.code = 2
        data.result.push("树节点删除失败，catalogid =" + catalogid[i])
      }
    }
    client.end()
    this.ctx.body = data
  }
}

module.exports = HomeController;
