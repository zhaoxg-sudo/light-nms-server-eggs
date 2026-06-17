'use strict';

const Controller = require('egg').Controller;
const { Pool, Client } = require('pg')


class TopoController extends Controller {
  // add catalog item
  async topoadditem() {
    //connect db
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    console.log("enter addtopoitem router", this.ctx.request.body)
    client.connect()
    let catalogid = this.ctx.request.body.catalogid
    let itemdata = this.ctx.request.body.itemdata
    console.log("catalogid=", catalogid)
    let data = {}
    data.result = {}
    let alreay_exist = await client.query('SELECT * from power_topo_catalog where catalogid =' + "'" + catalogid + "'")
    if (alreay_exist.rows.length > 0) {
      console.log('数据库中已经有该topo节点，删除该topo节点,catalogid =', catalogid)
      alreay_exist = await client.query('DELETE from power_topo_catalog where catalogid =' + "'" + catalogid + "'")
    }
    await client.query('INSERT INTO power_topo_catalog (catalogid,itemdata) VALUES (' + 
            "'" + catalogid + "'" + ","+
            "'" + itemdata +"')")
            console.log('数据库添加树topo节点成功！！！！，新增节点的catalogid =', catalogid)
    data.code = 1
    data.result = {catalogid:catalogid, itemdata:itemdata}
    client.end()
    this.ctx.body = data
  }
   // del topo item
   async topodelitem() {
    //connect db
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    console.log("enter topodelitem router", this.ctx.request.body)
    client.connect()
    let catalogid = this.ctx.request.body
    console.log("catalogid=", catalogid)
    let data = {}
    data.result = []
    for (let i = 0; i < catalogid.length; i++ ) {
      let order = await client.query('DELETE from power_topo_catalog where catalogid =' + "'" + catalogid[i] + "'")
      console.log(order)
      if (order.rowCount > 0) {
      console.log('数据库中topo节点删除成功,catalogid =', catalogid[i])
      data.code = 1
      data.result.push("topo节点删除成功，catalogid =" + catalogid[i])
      } else {
        console.log('数据库中topo节点删除失败,catalogid =', catalogid[i])
        data.code = 2
        data.result.push("topo节点删除失败，catalogid =" + catalogid[i])
      }
    }
    client.end()
    this.ctx.body = data
  }
  // get topo item
  async topogetitem() {
    //connect db
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    console.log("enter topogetitem router", this.ctx.params)
    client.connect()
    let catalogid = this.ctx.params.catalogid
    console.log("topo catalogid=", catalogid)
    let data = {}
    data.result = []
    let itemdata = await client.query('SELECT * from power_topo_catalog where catalogid =' + "'" + catalogid + "'")
    console.log("topo itemdata=", itemdata.rows)
    if (itemdata.rows.length > 0) {
      data.code = 1
      data.result = {catalogid:catalogid, itemdata:itemdata.rows[0].itemdata}
    } else {
      data.code = 2
      data.result = {catalogid:catalogid, itemdata:null}
    }
    
    client.end()
    this.ctx.body = data
  }
}

module.exports = TopoController;
