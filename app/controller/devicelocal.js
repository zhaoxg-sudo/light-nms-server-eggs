'use strict';

const Controller = require('egg').Controller;
const { Pool, Client } = require('pg')


class DevicelocalController extends Controller {

  // getrunstatus
  async devicelocalgetrunstatus() {
    
    //connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter devicelocalgetrunstatus", this.ctx.params)
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
        let resultArr = [0xaa,3,6,0xff,0,0,0,55,0];
        // 计算checksum
        let checksum = 0;
        for (var i = 3; i < 8; i++) {
            checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
            //console.log(checksum);
        }
        
        checksum = checksum % 128; //取128的模
        checksum &=  0xff;//去掉可能有的高位
        // console.log('checksum=', checksum);
        resultArr[8] = checksum;

   let sid = 0;
   sid = await this.ctx.service.power.getSessionID();
   token = sid
   //console.log("SESSION ID ="+SESSION);
   //消息插入序列号
   {
    //1,十进制转4字节字符串
    let sidString = "00000000";
    let sidX = parseInt(sid).toString(16);
    let sidXstring = sidString.slice(0,(8 - sidX.length)) +sidX;
    //2,提取4字节字符串
    let s4 = sidXstring.slice(0,2);
    // console.log(s4);
    //console.log(planXstring);
    let s5 = sidXstring.slice(2,4);
    // console.log(s5);
    //console.log(planXstring);
    let s6 = sidXstring.slice(4,6);
    // console.log(s6);
    //console.log(planXstring);
    let s7 = sidXstring.slice(6,8);
    console.log("=====插入的序列号为：=====")
    console.log(s4+s5+s6+s7);
    //3,复制序列号并重新计算sum
    resultArr[7] = parseInt(s7,16);
    resultArr[6] = parseInt(s6,16);
    resultArr[5] = parseInt(s5,16);
    resultArr[4] = parseInt(s4,16);
    checksum = 0;    
         for (var i = 3; i < 8; i++) {
             checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
             //console.log(checksum);
         }
         
         checksum = checksum % 128; //取128的模
         checksum &=  0xff;//去掉可能有的高位
         // console.log('插入token 后的checksum=', checksum);
         resultArr[8] = checksum;
         // console.log("devicelocalgetrunstatus:发送数据:");
         // console.log(Buffer.from(resultArr))
         sendArr = resultArr
        
      }
        console.log("devicelocalgetrunstatus:预发送数据:");
        console.log(Buffer.from(resultArr))
        /*let err= await this.ctx.service.power.sendMsg(Buffer.from(resultArr),deviceip);
        if (err) {
            console.log('---switch on cmd is err---');
        } else {
            console.log("---switch on cmd is ok---");
        }*/
      } else {
        data.code = 2
        console.log("catalog data is not exist , catalog= ", catalogid)
      }
      await this.ctx.service.power.sendMsgPromiseTimeout(token,Buffer.from(sendArr),ip)
                    .then((e)=>{
                        console.log("devicelocalgetrunstatus:promise resolve 处理结束-----------------",e);
                        let receiveMsg = e.msg
                        let code = 1   
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
                    .catch((e)=>{
                        console.log("devicelocalgetrunstatus:promise reject 处理超时？？？？？？？？？",e);
                        let receiveMsg = '设备应答超时，读取数据失败？？'
                        let code = -1
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
      
      // close db
      client.end()
  }
  //devicelocalgetsetparam
  async devicelocalgetsetparam() {
    
    //connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter devicelocalgetsetparam", this.ctx.params)
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
        let resultArr = [0xaa,5,5,0,0,0,0,1,1];
        // 计算checksum
        let checksum = 0;
        for (var i = 3; i < 8; i++) {
            checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
            //console.log(checksum);
        }
        
        checksum = checksum % 128; //取128的模
        checksum &=  0xff;//去掉可能有的高位
        // console.log('checksum=', checksum);
        resultArr[8] = checksum;

   let sid = 0;
   sid = await this.ctx.service.power.getSessionID();
   token = sid
   //console.log("SESSION ID ="+SESSION);
   //消息插入序列号
   {
    //1,十进制转4字节字符串
    let sidString = "00000000";
    let sidX = parseInt(sid).toString(16);
    let sidXstring = sidString.slice(0,(8 - sidX.length)) +sidX;
    //2,提取4字节字符串
    let s4 = sidXstring.slice(0,2);
    // console.log(s4);
    //console.log(planXstring);
    let s5 = sidXstring.slice(2,4);
    // console.log(s5);
    //console.log(planXstring);
    let s6 = sidXstring.slice(4,6);
    // console.log(s6);
    //console.log(planXstring);
    let s7 = sidXstring.slice(6,8);
    console.log("=====插入的序列号为：=====")
    console.log(s4+s5+s6+s7);
    //3,复制序列号并重新计算sum
    resultArr[7] = parseInt(s7,16);
    resultArr[6] = parseInt(s6,16);
    resultArr[5] = parseInt(s5,16);
    resultArr[4] = parseInt(s4,16);
    checksum = 0;    
         for (var i = 3; i < 8; i++) {
             checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
             //console.log(checksum);
         }
         
         checksum = checksum % 128; //取128的模
         checksum &=  0xff;//去掉可能有的高位
         // console.log('插入token 后的checksum=', checksum);
         resultArr[8] = checksum;
         // console.log("devicelocalgetrunstatus:发送数据:");
         // console.log(Buffer.from(resultArr))
         sendArr = resultArr
        
      }
        console.log("devicelocalgetsetparam:预发送数据:");
        console.log(Buffer.from(resultArr))
        /*let err= await this.ctx.service.power.sendMsg(Buffer.from(resultArr),deviceip);
        if (err) {
            console.log('---switch on cmd is err---');
        } else {
            console.log("---switch on cmd is ok---");
        }*/
      } else {
        data.code = 2
        console.log("catalog data is not exist , catalog= ", catalogid)
      }
      await this.ctx.service.power.sendMsgPromiseTimeout(token,Buffer.from(sendArr),ip)
                    .then((e)=>{
                        console.log("devicelocalgetsetparam:promise resolve 处理结束-----------------",e);
                        let receiveMsg = e.msg
                        let code = 1   
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
                    .catch((e)=>{
                        console.log("devicelocalgetsetparam:promise reject 处理超时？？？？？？？？？",e);
                        let receiveMsg = '设备应答超时，读取数据失败？？'
                        let code = -1
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
      
      // close db
      client.end()
  }
  //devicelocalgetsubmoduleid
  async devicelocalgetsubmoduleid() {
    
    //connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter devicelocalgetsubmoduleid", this.ctx.params)
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
        let resultArr = [0xaa,6,5,0,0,0,0,1,0];
        // 计算checksum
        let checksum = 0;
        for (var i = 3; i < 8; i++) {
            checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
            //console.log(checksum);
        }
        
        checksum = checksum % 128; //取128的模
        checksum &=  0xff;//去掉可能有的高位
        // console.log('checksum=', checksum);
        resultArr[8] = checksum;

   let sid = 0;
   sid = await this.ctx.service.power.getSessionID();
   token = sid
   //console.log("SESSION ID ="+SESSION);
   //消息插入序列号
   {
    //1,十进制转4字节字符串
    let sidString = "00000000";
    let sidX = parseInt(sid).toString(16);
    let sidXstring = sidString.slice(0,(8 - sidX.length)) +sidX;
    //2,提取4字节字符串
    let s4 = sidXstring.slice(0,2);
    // console.log(s4);
    //console.log(planXstring);
    let s5 = sidXstring.slice(2,4);
    // console.log(s5);
    //console.log(planXstring);
    let s6 = sidXstring.slice(4,6);
    // console.log(s6);
    //console.log(planXstring);
    let s7 = sidXstring.slice(6,8);
    console.log("=====插入的序列号为：=====")
    console.log(s4+s5+s6+s7);
    //3,复制序列号并重新计算sum
    resultArr[7] = parseInt(s7,16);
    resultArr[6] = parseInt(s6,16);
    resultArr[5] = parseInt(s5,16);
    resultArr[4] = parseInt(s4,16);
    checksum = 0;    
         for (var i = 3; i < 8; i++) {
             checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
             //console.log(checksum);
         }
         
         checksum = checksum % 128; //取128的模
         checksum &=  0xff;//去掉可能有的高位
         // console.log('插入token 后的checksum=', checksum);
         resultArr[8] = checksum;
         // console.log("devicelocalgetrunstatus:发送数据:");
         // console.log(Buffer.from(resultArr))
         sendArr = resultArr
        
      }
        console.log("devicelocalgetsubmoduleid:预发送数据:");
        console.log(Buffer.from(resultArr))
        /*let err= await this.ctx.service.power.sendMsg(Buffer.from(resultArr),deviceip);
        if (err) {
            console.log('---switch on cmd is err---');
        } else {
            console.log("---switch on cmd is ok---");
        }*/
      } else {
        data.code = 2
        console.log("catalog data is not exist , catalog= ", catalogid)
      }
      await this.ctx.service.power.sendMsgPromiseTimeout(token,Buffer.from(sendArr),ip)
                    .then((e)=>{
                        console.log("devicelocalgetsubmoduleid:promise resolve 处理结束-----------------",e);
                        let receiveMsg = e.msg
                        let code = 1   
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
                    .catch((e)=>{
                        console.log("devicelocalgetsubmoduleid:promise reject 处理超时？？？？？？？？？",e);
                        let receiveMsg = '设备应答超时，读取数据失败？？'
                        let code = -1
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
      
      // close db
      client.end()
  }
   //devicelocalgetalarmdata
   async devicelocalgetalarmdata() {
    
    //connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter devicelocalgetalarmdata", this.ctx.params)
      client.connect()
      let thisctx = this.ctx
      let catalogid = this.ctx.params.catalogid
      let id = this.ctx.params.id
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
        let resultArr = [0xaa,4,6,0xff,0,0,0,1,0];
        // 填入模块id
        resultArr[3] = parseInt(id,16);
        // 计算checksum
        let checksum = 0;
        for (var i = 3; i < 8; i++) {
            checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
            //console.log(checksum);
        }
        
        checksum = checksum % 128; //取128的模
        checksum &=  0xff;//去掉可能有的高位
        // console.log('checksum=', checksum);
        resultArr[8] = checksum;

   let sid = 0;
   sid = await this.ctx.service.power.getSessionID();
   token = sid
   //console.log("SESSION ID ="+SESSION);
   //消息插入序列号
   {
    //1,十进制转4字节字符串
    let sidString = "00000000";
    let sidX = parseInt(sid).toString(16);
    let sidXstring = sidString.slice(0,(8 - sidX.length)) +sidX;
    //2,提取4字节字符串
    let s4 = sidXstring.slice(0,2);
    // console.log(s4);
    //console.log(planXstring);
    let s5 = sidXstring.slice(2,4);
    // console.log(s5);
    //console.log(planXstring);
    let s6 = sidXstring.slice(4,6);
    // console.log(s6);
    //console.log(planXstring);
    let s7 = sidXstring.slice(6,8);
    console.log("=====插入的序列号为：=====")
    console.log(s4+s5+s6+s7);
    //3,复制序列号并重新计算sum
    resultArr[7] = parseInt(s7,16);
    resultArr[6] = parseInt(s6,16);
    resultArr[5] = parseInt(s5,16);
    resultArr[4] = parseInt(s4,16);
    checksum = 0;    
         for (var i = 3; i < 8; i++) {
             checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
             //console.log(checksum);
         }
         
         checksum = checksum % 128; //取128的模
         checksum &=  0xff;//去掉可能有的高位
         // console.log('插入token 后的checksum=', checksum);
         resultArr[8] = checksum;
         // console.log("devicelocalgetrunstatus:发送数据:");
         // console.log(Buffer.from(resultArr))
         sendArr = resultArr
        
      }
        console.log("devicelocalgetalarmdata:预发送数据:");
        console.log(Buffer.from(resultArr))
        /*let err= await this.ctx.service.power.sendMsg(Buffer.from(resultArr),deviceip);
        if (err) {
            console.log('---switch on cmd is err---');
        } else {
            console.log("---switch on cmd is ok---");
        }*/
      } else {
        data.code = 2
        console.log("catalog data is not exist , catalog= ", catalogid)
      }
      await this.ctx.service.power.sendMsgPromiseTimeout(token,Buffer.from(sendArr),ip)
                    .then((e)=>{
                        console.log("devicelocalgetalarmdata:promise resolve 处理结束-----------------",e);
                        let receiveMsg = e.msg
                        let code = 1   
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
                    .catch((e)=>{
                        console.log("devicelocalgetalarmdata:promise reject 处理超时？？？？？？？？？",e);
                        let receiveMsg = '设备应答超时，读取数据失败？？'
                        let code = -1
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
      
      // close db
      client.end()
  }
  //devicelocalgetpoweroff
  async devicelocalgetpoweroff() {
    
     //connect db
     const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    console.log("enter devicelocalgetpoweroff", this.ctx.params)
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
      let resultArr = [0xaa,2,7,0xff,0xaa,0,0,0,1,0];
      resultArr[4] = 0xaa
      // 计算checksum
      let checksum = 0;
      for (var i = 3; i < 9; i++) {
          checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
          //console.log(checksum);
      }
      
      checksum = checksum % 128; //取128的模
      checksum &=  0xff;//去掉可能有的高位
      // console.log('checksum=', checksum);
      resultArr[9] = checksum;

 let sid = 0;
 sid = await this.ctx.service.power.getSessionID();
 token = sid
 //console.log("SESSION ID ="+SESSION);
 //消息插入序列号
 {
  //1,十进制转4字节字符串
  let sidString = "00000000";
  let sidX = parseInt(sid).toString(16);
  let sidXstring = sidString.slice(0,(8 - sidX.length)) +sidX;
  //2,提取4字节字符串
  let s4 = sidXstring.slice(0,2);
  // console.log(s4);
  //console.log(planXstring);
  let s5 = sidXstring.slice(2,4);
  // console.log(s5);
  //console.log(planXstring);
  let s6 = sidXstring.slice(4,6);
  // console.log(s6);
  //console.log(planXstring);
  let s7 = sidXstring.slice(6,8);
  console.log("=====插入的序列号为：=====")
  console.log(s4+s5+s6+s7);
  //3,复制序列号并重新计算sum
  resultArr[8] = parseInt(s7,16);
  resultArr[7] = parseInt(s6,16);
  resultArr[6] = parseInt(s5,16);
  resultArr[5] = parseInt(s4,16);
  checksum = 0;    
       for (var i = 3; i < 9; i++) {
           checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
           //console.log(checksum);
       }
       
       checksum = checksum % 128; //取128的模
       checksum &=  0xff;//去掉可能有的高位
       // console.log('插入token 后的checksum=', checksum);
       resultArr[9] = checksum;
       // console.log("devicelocalgetrunstatus:发送数据:");
       // console.log(Buffer.from(resultArr))
       sendArr = resultArr
      
    }
      console.log("devicelocalgetpoweroff:预发送数据:");
      console.log(Buffer.from(resultArr))
      /*let err= await this.ctx.service.power.sendMsg(Buffer.from(resultArr),deviceip);
      if (err) {
          console.log('---switch on cmd is err---');
      } else {
          console.log("---switch on cmd is ok---");
      }*/
    } else {
      data.code = 2
      console.log("catalog data is not exist , catalog= ", catalogid)
    }
    await this.ctx.service.power.sendMsgPromiseTimeout(token,Buffer.from(sendArr),ip)
                  .then((e)=>{
                      console.log("devicelocalgetpoweroff:promise resolve 处理结束-----------------",e);
                      let receiveMsg = e.msg
                      let code = 1   
                      data = {result:receiveMsg,code:code}
                     
                      thisctx.body = data 
                  })
                  .catch((e)=>{
                      console.log("devicelocalgetpoweroff:promise reject 处理超时？？？？？？？？？",e);
                      let receiveMsg = '设备应答超时，读取数据失败？？'
                      let code = -1
                      data = {result:receiveMsg,code:code}
                     
                      thisctx.body = data 
                  })
    
    // close db
    client.end()
  }
  //devicelocalgetpoweron
  async devicelocalgetpoweron() {
    
    //connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter devicelocalgetpoweron", this.ctx.params)
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
        let resultArr = [0xaa,2,7,0xff,0x55,0,0,0,1,0x55];
        resultArr[4] = 0x55
        // 计算checksum
        let checksum = 0;
        for (var i = 3; i < 9; i++) {
            checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
            //console.log(checksum);
        }
        
        checksum = checksum % 128; //取128的模
        checksum &=  0xff;//去掉可能有的高位
        // console.log('checksum=', checksum);
        resultArr[9] = checksum;

   let sid = 0;
   sid = await this.ctx.service.power.getSessionID();
   token = sid
   //console.log("SESSION ID ="+SESSION);
   //消息插入序列号
   {
    //1,十进制转4字节字符串
    let sidString = "00000000";
    let sidX = parseInt(sid).toString(16);
    let sidXstring = sidString.slice(0,(8 - sidX.length)) +sidX;
    //2,提取4字节字符串
    let s4 = sidXstring.slice(0,2);
    // console.log(s4);
    //console.log(planXstring);
    let s5 = sidXstring.slice(2,4);
    // console.log(s5);
    //console.log(planXstring);
    let s6 = sidXstring.slice(4,6);
    // console.log(s6);
    //console.log(planXstring);
    let s7 = sidXstring.slice(6,8);
    console.log("=====插入的序列号为：=====")
    console.log(s4+s5+s6+s7);
    //3,复制序列号并重新计算sum
    resultArr[8] = parseInt(s7,16);
    resultArr[7] = parseInt(s6,16);
    resultArr[6] = parseInt(s5,16);
    resultArr[5] = parseInt(s4,16);
    checksum = 0;    
         for (var i = 3; i < 9; i++) {
             checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
             //console.log(checksum);
         }
         
         checksum = checksum % 128; //取128的模
         checksum &=  0xff;//去掉可能有的高位
         // console.log('插入token 后的checksum=', checksum);
         resultArr[9] = checksum;
         // console.log("devicelocalgetrunstatus:发送数据:");
         // console.log(Buffer.from(resultArr))
         // resultArr = [0xaa,2,7,0xff,0x55,0,0,0,1,0x55];
         sendArr = resultArr
        
      }
        console.log("devicelocalgetpoweron:预发送数据:");
        console.log(Buffer.from(resultArr))
        /*let err= await this.ctx.service.power.sendMsg(Buffer.from(resultArr),deviceip);
        if (err) {
            console.log('---switch on cmd is err---');
        } else {
            console.log("---switch on cmd is ok---");
        }*/
      } else {
        data.code = 2
        console.log("catalog data is not exist , catalog= ", catalogid)
      }
      await this.ctx.service.power.sendMsgPromiseTimeout(token,Buffer.from(sendArr),ip)
                    .then((e)=>{
                        console.log("devicelocalgetpoweron:promise resolve 处理结束-----------------",e);
                        let receiveMsg = e.msg
                        let code = 1   
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
                    .catch((e)=>{
                        console.log("devicelocalgetpoweron:promise reject 处理超时？？？？？？？？？",e);
                        let receiveMsg = '设备应答超时，读取数据失败？？'
                        let code = -1
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
      
      // close db
      client.end()
  }
  //devicelocalsetpowerparam
  async devicelocalsetpowerparam() {
    
    //connect db
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
      })
      console.log("enter devicelocalsetpowerparam", this.ctx.request.body)
      client.connect()
      let thisctx = this.ctx
      let catalogid = this.ctx.request.body.catalogid
      let setparamv = this.ctx.request.body.setparamv
      let setparamampercetage = this.ctx.request.body.setparamampercetage
      let shareamflag = this.ctx.request.body.shareamflag
      let autopoweronflag = this.ctx.request.body.autopoweronflag
      let submoduleratedkw = this.ctx.request.body.submoduleratedkw
      
      
      
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
        let resultArr = [0xaa,1,0x0b,0x19,0x64,0x64,0x55,0x55,2,0,0,0,1,0x0e];
        //1,十进制转2字节字符串
        console.log("setparamv = ", setparamv)
        let sidString = "0000";
        let sidX = parseInt(setparamv).toString(16);
        let sidXstring = sidString.slice(0,(4 - sidX.length)) +sidX;
        //2,提取2字节字符串
        let ss4 = sidXstring.slice(0,2);
        console.log(ss4);
        
        let ss5 = sidXstring.slice(2,4);
        console.log(ss5);
       
        console.log("=====插入的输出电压为：=====")
        console.log(ss4+ss5);
        //3,复制序列号并重新计算sum
        resultArr[3] = parseInt(ss4,16);
        resultArr[4] = parseInt(ss5,16);
        resultArr[5] = setparamampercetage;
        resultArr[6] = shareamflag;
        resultArr[7] = autopoweronflag;
        resultArr[8] = submoduleratedkw;
        
        
   let sid = 0;
   sid = await this.ctx.service.power.getSessionID();
   token = sid
   //console.log("SESSION ID ="+SESSION);
   //消息插入序列号
   {
    //1,十进制转4字节字符串
    let sidString = "00000000";
    let sidX = parseInt(sid).toString(16);
    let sidXstring = sidString.slice(0,(8 - sidX.length)) +sidX;
    //2,提取4字节字符串
    let s4 = sidXstring.slice(0,2);
    // console.log(s4);
    //console.log(planXstring);
    let s5 = sidXstring.slice(2,4);
    // console.log(s5);
    //console.log(planXstring);
    let s6 = sidXstring.slice(4,6);
    // console.log(s6);
    //console.log(planXstring);
    let s7 = sidXstring.slice(6,8);
    console.log("=====插入的序列号为：=====")
    console.log(s4+s5+s6+s7);
    //3,复制序列号并重新计算sum
    resultArr[12] = parseInt(s7,16);
    resultArr[11] = parseInt(s6,16);
    resultArr[10] = parseInt(s5,16);
    resultArr[9] = parseInt(s4,16);
    let checksum = 0;    
         for (var i = 3; i < 13; i++) {
             checksum = checksum + resultArr[i];//从Sip号码开始到命令序号共20个字节的和
             //console.log(checksum);
         }
         
         checksum = checksum % 128; //取128的模
         checksum &=  0xff;//去掉可能有的高位
         // console.log('插入token 后的checksum=', checksum);
         resultArr[13] = checksum;
         // console.log("devicelocalgetrunstatus:发送数据:");
         // console.log(Buffer.from(resultArr))
         // resultArr = [0xaa,2,7,0xff,0x55,0,0,0,1,0x55];
         sendArr = resultArr
        
      }
        console.log("devicelocalsetpowerparam:预发送数据:");
        console.log(Buffer.from(resultArr))
        /*let err= await this.ctx.service.power.sendMsg(Buffer.from(resultArr),deviceip);
        if (err) {
            console.log('---switch on cmd is err---');
        } else {
            console.log("---switch on cmd is ok---");
        }*/
      } else {
        data.code = 2
        console.log("catalog data is not exist , catalog= ", catalogid)
      }
      await this.ctx.service.power.sendMsgPromiseTimeout(token,Buffer.from(sendArr),ip)
                    .then((e)=>{
                        console.log("devicelocalsetpowerparam:promise resolve 处理结束-----------------",e);
                        let receiveMsg = e.msg
                        let code = 1   
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
                    .catch((e)=>{
                        console.log("devicelocalsetpowerparam:promise reject 处理超时？？？？？？？？？",e);
                        let receiveMsg = '设备应答超时，读取数据失败？？'
                        let code = -1
                        data = {result:receiveMsg,code:code}
                       
                        thisctx.body = data 
                    })
      
      // close db
      client.end()
  }

}
module.exports = DevicelocalController;