const Service = require('egg').Service;
const { Pool, Client } = require('pg')
const dgram = require('dgram')
const server = dgram.createSocket('udp4');
let promisePool = [];
const  websocketname = {
  tset: "test",
  va: "va",
  onoff: "onoff",
  alarm: "alarm"
}
global.websocketsend = {}
global.writeDB = {}
let heartbeatlist = []
// 初始化离线告警定时器
const clientoffline = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'power',
  password: 'shyh2017',
  port: 5432,
})
clientoffline.connect()
let updateTimer = setInterval(() => {
  // console.log('show_table发起参数更新')
  if (heartbeatlist instanceof Array) {
    for (let i = 0; i < heartbeatlist.length; i++) {
      heartbeatlist[i].times = heartbeatlist[i].times + 1
      if ( heartbeatlist[i].times> 10) {
        // 发生告警
        if(!heartbeatlist[i].alarmfired) {
          let datejs0 = new Date()
          let yearjs0 = datejs0.getFullYear() 
          let monthjs0 =  datejs0.getMonth()+1 
          let dayjs0 = datejs0.getDate()
          let hourjs0 =  datejs0.getHours() 
          let minutejs0 = datejs0.getMinutes()
          let secondjs0 = datejs0.getSeconds()
          let timeoffline = yearjs0 + '-' + String(monthjs0 >9?monthjs0:("0"+monthjs0)) + '-' + String(dayjs0 >9?dayjs0:("0"+dayjs0)) + ' ' +  String(hourjs0 >9?hourjs0:("0"+hourjs0)) + ':' + String(minutejs0 >9?minutejs0:("0"+minutejs0)) + ':' + String(secondjs0 >9?secondjs0:("0"+secondjs0)) 
          console.log('发生了离线告警______________________________', heartbeatlist[i])
          heartbeatlist[i].times = 0
          heartbeatlist[i].alarmfired = true
          heartbeatlist[i].alarmfiredtime = timeoffline
          // 离线告警处理
          // 1,查询当前告警的catalogid
          let catalogid = ''
          let label = ''
          let saveData = {
          alarmid: '',
          alarmstation: label,
          alarmmudid: catalogid,
          alarmreceivedtime: timeoffline,
          alarmfiredtime: timeoffline,
          alarmdetail: 'offline',
          alarmreason: '',
          alarmlevel: '',
          alarmconfirmedflag: '',
          alarmconfirmedtime: '',
          alarmconfirmedinfo: '',
          alarmrestoreflag: '',
          alarmrestoreinfo: '',
          alarmsourceip: heartbeatlist[i].alarmip,
          alarmaddition: ''
        }
        clientoffline.query('SELECT * from power_station_tree where ipaddress =' + "'" +  heartbeatlist[i].alarmip + "'")
          .then((res)=>{
            console.log('updateTimer,SELECT * from power_station_tree  ',res.rows)
            if (res.rowCount >0) {
              catalogid = res.rows[0].catalogid
              label = res.rows[0].label
              saveData.alarmid = catalogid + '_' + timeoffline + '_' + 'offline'
              saveData.alarmstation = label
              saveData.alarmmudid = catalogid
              // 2,写入当前告警数据库
              let insertSqlOff = "insert into power_alarm_current (alarmid,alarmstation,alarmmudid,alarmreceivedtime,alarmfiredtime,alarmdetail,alarmreason,alarmlevel,alarmconfirmedflag,alarmconfirmedtime,alarmconfirmedinfo,alarmrestoreflag,alarmrestoreinfo,alarmsourceip,alarmaddition) \
              values ("+ "'"+saveData.alarmid+"'"+",\
              "+ "'"+saveData.alarmstation+"'"+",\
              "+ "'"+saveData.alarmmudid+"'"+",\
              "+ "'"+saveData.alarmreceivedtime+"'"+",\
              "+ "'"+saveData.alarmfiredtime+"'"+",\
              "+ "'"+saveData.alarmdetail+"'"+",\
              "+ "'"+saveData.alarmreason+"'"+",\
              "+ "'"+saveData.alarmlevel+"'"+",\
              "+ "'"+saveData.alarmconfirmedflag+"'"+",\
              "+ "'"+saveData.alarmconfirmedtime+"'"+",\
              "+ "'"+saveData.alarmconfirmedinfo+"'"+",\
              "+ "'"+saveData.alarmrestoreflag+"'"+",\
              "+ "'"+saveData.alarmrestoreinfo+"'"+",\
              "+ "'"+saveData.alarmsourceip+"'"+",\
              "+ "'"+saveData.alarmaddition+"'"+")";
              console.log(insertSqlOff)
              clientoffline.query(insertSqlOff)
                .then((res)=>{
                //   if (insertErr)
                //     console.log("insertCurrentAlarmDb---af，新增alarm数据库记录：",saveData); 
                //   else console.log("insertCurrentAlarmDb---af，新增alarm数据库记录失败？？？？？？？：",saveData); 
                // })
                // 2,websocket告警上传客户端
                let websocketoffline = websocketsend
                let codeoffline = {}
                if (websocketoffline.enabled==1) {
                  codeoffline.socketname = websocketname.alarm
                  codeoffline.functioncode = '00'
                  codeoffline.alarmfired = true
                  codeoffline.alarmrestore = false
                  codeoffline.address = heartbeatlist[i].alarmip
                  codeoffline.stamp = timeoffline
                  websocketoffline.send(codeoffline)
                  console.log('-------updateTimer,box has sent 离线告警 websocket message=',codeoffline)
                } else {
                  console.log('-------updateTimer,box websocketsend function is not exit,please run 刷新 to reset',codeoffline)
                }
                // clientoffline.end()
                })
                .catch((e)=>{
                  console.log('updateTimer,insert into power_alarm_current 错误',e)
                  // clientoffline.end()
                })
            }
          })
          .catch((e)=>{
            console.log('updateTimer,SELECT * from power_station_tree 错误',e)
            // clientaf.end()
          })
          // end 离线告警处理
        } else {
          console.log('已经发生了离线告警,但是还未恢复______________________________', heartbeatlist[i])
          heartbeatlist[i].times = 0
        }
      }
    }
  }
}, 2000)
const clientheart = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'power',
  password: 'shyh2017',
  port: 5432,
})
clientheart.connect()
let protocoltype = '7'
clientheart.query('SELECT * from power_station_tree where protocoltype =' + "'" +  protocoltype + "'")
  .then((res)=>{
    //console.log('clientheart:=',res.rows)
    if (res.rowCount >0) {
    // 1,在加入heartbeatlist
      let joindevice = res.rows
      let deviceoffline = []
      for (let i = 0; i < joindevice.length; i++) {
        deviceoffline[i] = {
          times: 0,
          alarmfired: false,
          alarmrestore: false,
          alarmname: 'offline',
          alarmfiredtime: '',
          alarmrestoretime: '',
          alarmip: ''
        }
        deviceoffline[i].alarmip = joindevice[i].ipaddress
        heartbeatlist.push(deviceoffline[i])
      }
    }
    clientheart.end()
  })
  .catch((e)=>{
    console.log('clientheart 查询当前告警数据库错误',e)
    clientheart.end()
  })
// heartbeatlist.push(deviceoffline)
// deviceoffline.alarmip = '192.168.1.201'
// heartbeatlist.push(deviceoffline)
let session = 0;
let _this = this;
let alarmFiredFlag = false;
let alarmTable = [];
let sTable = [];
let timeoutArr = [];
let deviceParams = [];
let errorTimes = 0;
let heartbeat = 0
let timeOutParams = {
    com: "00aa",
    auv: "0055",
    buv: "0055",
    cuv: "0055",
    aov: "0055",
    bov: "0055",
    cov: "0055",
    aoa: "0055",
    boa: "0055",
    coa: "0055",
    afu: "0055",
    bfu: "0055",
    cfu: "0055",
    abcv: "0000",
    av: "0000",
    bv: "0000",
    cv: "0000",
    abca: "0000",
    aa: "0000",
    ba: "0000",
    ca: "0000",
    mainstatus: "0000",
    stabilestatus: "0000",
    stepstatus: "0000",
    syncstatus: "0000",
    autostatus : "0000",
    time: "2022-12-06 09:41:56",
    ipaddress: "0.0.0.0"
}
// 公用数据库
const client00 = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'power',
  password: 'shyh2017',
  port: 5432,
})
client00.connect()
// 绑定本机的ip地址
server.bind(7500, '0.0.0.0');
// 开启socket 监听服务
server.on("message", function (msg, rinfo) {
  let startRecDataFlag = 1
  let rcmsg = msg;
  let ipinfo = rinfo;
 
  let date = new Date()
  let year = date.getFullYear() 
  let month =  date.getMonth()+1 
  let day = date.getDate()
  let hour =  date.getHours() 
  let minute = date.getMinutes()
  let second = date.getSeconds()
  let time = year + '-' + String(month >9?month:("0"+month)) + '-' + String(day >9?day:("0"+day)) + ' ' +  String(hour >9?hour:("0"+hour)) + ':' + String(minute >9?minute:("0"+minute)) + ':' + String(second >9?second:("0"+second)) 
  // console.log("box port=7500设备端接收信息为：", msg.toString('hex'));
  let commType = 0
  let typeString = ''
  if (msg.toString('hex').length == 12) {
    commType = 0
    typeString = ''
  } else {
    commType = parseInt(msg.toString('hex').slice(16, 18), 16);
    typeString = msg.toString('hex').slice(16, 18)
  }
  //console.log("box port=7500设备端地址信息为：", rinfo);
  //console.log("box port=7500收到的信息为：", rcmsg,commType,time);
  
  //接收到消息处理
  if (startRecDataFlag) {
    switch (commType) {
      case 0x00:
        let ip00 = ipinfo.address
        //console.log('port=7500已接收到设备端发送的心跳数据：', msg, time, ip00)
        if (heartbeatlist instanceof Array) {
          for (let i = 0; i < heartbeatlist.length; i++) {
            if (heartbeatlist[i].alarmip == ip00) {
              heartbeatlist[i].times = 0
              // A offline告警恢复处理
              if (heartbeatlist[i].alarmfired) {
                console.log('发生了告警恢复：', heartbeatlist[i])
                heartbeatlist[i].alarmrestore = true
                heartbeatlist[i].alarmfired = false
                heartbeatlist[i].alarmrestoretime = time
                heartbeatlist[i].alarmip = ip00
                console.log('发生了告警恢复后：', heartbeatlist[i])
                // 告警数据库处理,将当前告警数据库,移到历史告警数据库
                // A end offline告警恢复处理
                // 1,数据库查询有无本IP的断电当前告警,有->处理'断电告警'告警恢复
              let alalrmoffline = 'offline'
              let currentAlarmOffline
              client00.query('SELECT * from power_alarm_current where alarmsourceip =' + "'" +  ipinfo.address + "'" + " and alarmdetail = " + "'" + alalrmoffline + "'")
                .then((res)=>{
                  if (res.rowCount >0) {
                    console.log('当前告警中,offline,但是还未恢复',res.rows,ipinfo.address)
                    // 0,发送告警恢复websocket
                    currentAlarmOffline = res.rows[0]
                    let websocketofflinerestore = websocketsend
                    let code00restore = {}
                    if (websocketofflinerestore.enabled==1) {
                      code00restore.socketname = websocketname.alarm
                      code00restore.functioncode = '00'
                      code00restore.alarmfired = false
                      code00restore.alarmrestore = true
                      code00restore.address = ipinfo.address
                      code00restore.stamp = time
                      websocketofflinerestore.send(code00restore)
                      console.log('-------00,box has sent 离线:告警恢复 websocket message=',code00restore)
                    } else {
                      console.log('-------00 告警恢复,box websocketsend function is not exit,please run 刷新 to reset',codeafrestore)
                    }
                    // 1,在当前告警数据库中删除offline
                    client00.query('DELETE from power_alarm_current where alarmsourceip =' + "'" +  ipinfo.address + "'" + " and alarmdetail = " + "'" + alalrmoffline + "'")
                    .then((s)=>{
                      console.log('offline 当前告警 删除',s.rows,ipinfo.address)
                      // 2,在历史告警数据库添加一条
                      let saveData00
                      currentAlarmOffline.alarmrestoreflag = true
                      currentAlarmOffline.alarmrestoreinfo = time
                      saveData00 = currentAlarmOffline
                      let insertSqlOff = "insert into power_alarm_history (alarmid,alarmstation,alarmmudid,alarmreceivedtime,alarmfiredtime,alarmdetail,alarmreason,alarmlevel,alarmconfirmedflag,alarmconfirmedtime,alarmconfirmedinfo,alarmrestoreflag,alarmrestoreinfo,alarmsourceip,alarmaddition) \
                      values ("+ "'"+saveData00.alarmid+"'"+",\
                              "+ "'"+saveData00.alarmstation+"'"+",\
                              "+ "'"+saveData00.alarmmudid+"'"+",\
                              "+ "'"+saveData00.alarmreceivedtime+"'"+",\
                              "+ "'"+saveData00.alarmfiredtime+"'"+",\
                              "+ "'"+saveData00.alarmdetail+"'"+",\
                              "+ "'"+saveData00.alarmreason+"'"+",\
                              "+ "'"+saveData00.alarmlevel+"'"+",\
                              "+ "'"+saveData00.alarmconfirmedflag+"'"+",\
                              "+ "'"+saveData00.alarmconfirmedtime+"'"+",\
                              "+ "'"+saveData00.alarmconfirmedinfo+"'"+",\
                              "+ "'"+saveData00.alarmrestoreflag+"'"+",\
                              "+ "'"+saveData00.alarmrestoreinfo+"'"+",\
                              "+ "'"+saveData00.alarmsourceip+"'"+",\
                              "+ "'"+saveData00.alarmaddition+"'"+")";
                      console.log(insertSqlOff)
                        client00.query(insertSqlOff)
                          .then((e)=>{       
                          console.log('offline 历史告警添加成功',e.rows,ipinfo.address)
                          // client00.end()
                          })
                          .catch((e)=>{
                            console.log('offline 历史告警添加数据库错误',e)
                            // client00.end()
                          })
                    })
                    .catch((e)=>{
                      console.log('offline 当前告警 删除错误',e)
                     // client00.end()
                    })
                  } else {
                    console.log('当前告警中,offline,',res.rows,ipinfo.address)
                  }
                })
                .catch((e)=>{
                  console.log('case 0x00 offline 查询当前告警数据库错误',e)
                  // client00.end()
                })
                // B 断电告警恢复判断与处理
              }
              // 1,数据库查询有无本IP的断电当前告警,有->处理'断电告警'告警恢复
              let alalrmdetail = 'shutdown'
              client00.query('SELECT * from power_alarm_current where alarmsourceip =' + "'" +  ipinfo.address + "'" + " and alarmdetail = " + "'" + alalrmdetail + "'")
                .then((res)=>{
                  if (res.rowCount >0) {
                    console.log('当前告警中,查询到存在告警shutdown,但是还未恢复',res.rows,ipinfo.address)
                    // 0,发送告警恢复websocket
                    let currentAlarm = res.rows[0]
                    let websocketafrestore = websocketsend
                    let codeafrestore = {}
                    if (websocketafrestore.enabled==1) {
                      codeafrestore.socketname = websocketname.alarm
                      codeafrestore.functioncode = 'af'
                      codeafrestore.alarmfired = false
                      codeafrestore.alarmrestore = true
                      codeafrestore.address = ipinfo.address
                      codeafrestore.stamp = time
                      websocketafrestore.send(codeafrestore)
                      console.log('-------af,box has sent 断电检测状态:告警恢复 websocket message=',codeafrestore)
                    } else {
                      console.log('-------af 告警恢复,box websocketsend function is not exit,please run 刷新 to reset',codeafrestore)
                    }
                    // 1,在当前告警数据库中删除
                    client00.query('DELETE from power_alarm_current where alarmsourceip =' + "'" +  ipinfo.address + "'" + " and alarmdetail = " + "'" + alalrmdetail + "'")
                    .then((s)=>{
                      console.log('shutdown 当前告警 删除',s.rows,ipinfo.address)
                      // 2,在历史告警数据库添加一条
                      let saveData
                      currentAlarm.alarmrestoreflag = true
                      currentAlarm.alarmrestoreinfo = time
                      saveData = currentAlarm
                      let insertSql00 = "insert into power_alarm_history (alarmid,alarmstation,alarmmudid,alarmreceivedtime,alarmfiredtime,alarmdetail,alarmreason,alarmlevel,alarmconfirmedflag,alarmconfirmedtime,alarmconfirmedinfo,alarmrestoreflag,alarmrestoreinfo,alarmsourceip,alarmaddition) \
                      values ("+ "'"+saveData.alarmid+"'"+",\
                              "+ "'"+saveData.alarmstation+"'"+",\
                              "+ "'"+saveData.alarmmudid+"'"+",\
                              "+ "'"+saveData.alarmreceivedtime+"'"+",\
                              "+ "'"+saveData.alarmfiredtime+"'"+",\
                              "+ "'"+saveData.alarmdetail+"'"+",\
                              "+ "'"+saveData.alarmreason+"'"+",\
                              "+ "'"+saveData.alarmlevel+"'"+",\
                              "+ "'"+saveData.alarmconfirmedflag+"'"+",\
                              "+ "'"+saveData.alarmconfirmedtime+"'"+",\
                              "+ "'"+saveData.alarmconfirmedinfo+"'"+",\
                              "+ "'"+saveData.alarmrestoreflag+"'"+",\
                              "+ "'"+saveData.alarmrestoreinfo+"'"+",\
                              "+ "'"+saveData.alarmsourceip+"'"+",\
                              "+ "'"+saveData.alarmaddition+"'"+")";
                      console.log(insertSql00)
                        client00.query(insertSql00)
                          .then((e)=>{       
                          console.log('shutdown 历史告警添加成功',e.rows,ipinfo.address)
                          // client00.end()
                          })
                          .catch((e)=>{
                            console.log('shutdown 历史告警添加数据库错误',e)
                            // client00.end()
                          })
                    })
                    .catch((e)=>{
                      console.log('hutdown 当前告警 删除错误',e)
                     // client00.end()
                    })
                  } else {
                    //console.log('当前告警中,不存在告警shutdown,',res.rows,ipinfo.address)
                  }
                })
                .catch((e)=>{
                  console.log('case 0x00 查询当前告警数据库错误',e)
                  // client00.end()
                })
            }
          }
        }
        break;
      case 0xaf:
        console.log('********** box 0xaf port=7500已接收到设备端发送的断电检测状态****************：', msg, time)
        // 时间间隔小于3秒的告警
        let dateaf = new Date()
        let yearaf = dateaf.getFullYear() 
        let monthaf =  dateaf.getMonth()+1 
        let dayaf = dateaf.getDate()
        let houraf =  dateaf.getHours() 
        let minuteaf = dateaf.getMinutes()
        let secondaf = dateaf.getSeconds()
        let timeaf = yearaf + '-' + String(monthaf >9?monthaf:("0"+monthaf)) + '-' + String(dayaf >9?dayaf:("0"+dayaf)) + ' ' +  String(houraf >9?houraf:("0"+houraf)) + ':' + String(minuteaf >9?minuteaf:("0"+minuteaf)) + ':' + String(secondaf >9?secondaf:("0"+secondaf)) 
        // 1,查询当前告警的catalogid
        const clientaf = new Client({
          user: 'postgres',
          host: '127.0.0.1',
          database: 'power',
          password: 'shyh2017',
          port: 5432,
        })
        clientaf.connect()
        let catalogid = ''
        let label = ''
        let saveData = {
          alarmid: '',
          alarmstation: label,
          alarmmudid: catalogid,
          alarmreceivedtime: timeaf,
          alarmfiredtime: timeaf,
          alarmdetail: 'shutdown',
          alarmreason: '',
          alarmlevel: '',
          alarmconfirmedflag: '',
          alarmconfirmedtime: '',
          alarmconfirmedinfo: '',
          alarmrestoreflag: '',
          alarmrestoreinfo: '',
          alarmsourceip: ipinfo.address,
          alarmaddition: ''
        }
        clientaf.query('SELECT * from power_station_tree where ipaddress =' + "'" +  ipinfo.address + "'")
          .then((res)=>{
            console.log('',res.rows)
            if (res.rowCount >0) {
              catalogid = res.rows[0].catalogid
              label = res.rows[0].label
              saveData.alarmid = catalogid + '_' + timeaf + '_' + 'shutdown'
              saveData.alarmstation = label
              saveData.alarmmudid = catalogid
              // 2,写入当前告警数据库
              let insertSql = "insert into power_alarm_current (alarmid,alarmstation,alarmmudid,alarmreceivedtime,alarmfiredtime,alarmdetail,alarmreason,alarmlevel,alarmconfirmedflag,alarmconfirmedtime,alarmconfirmedinfo,alarmrestoreflag,alarmrestoreinfo,alarmsourceip,alarmaddition) \
              values ("+ "'"+saveData.alarmid+"'"+",\
              "+ "'"+saveData.alarmstation+"'"+",\
              "+ "'"+saveData.alarmmudid+"'"+",\
              "+ "'"+saveData.alarmreceivedtime+"'"+",\
              "+ "'"+saveData.alarmfiredtime+"'"+",\
              "+ "'"+saveData.alarmdetail+"'"+",\
              "+ "'"+saveData.alarmreason+"'"+",\
              "+ "'"+saveData.alarmlevel+"'"+",\
              "+ "'"+saveData.alarmconfirmedflag+"'"+",\
              "+ "'"+saveData.alarmconfirmedtime+"'"+",\
              "+ "'"+saveData.alarmconfirmedinfo+"'"+",\
              "+ "'"+saveData.alarmrestoreflag+"'"+",\
              "+ "'"+saveData.alarmrestoreinfo+"'"+",\
              "+ "'"+saveData.alarmsourceip+"'"+",\
              "+ "'"+saveData.alarmaddition+"'"+")";
              console.log(insertSql)
              clientaf.query(insertSql)
                .then((res)=>{
                //   if (insertErr)
                //     console.log("insertCurrentAlarmDb---af，新增alarm数据库记录：",saveData); 
                //   else console.log("insertCurrentAlarmDb---af，新增alarm数据库记录失败？？？？？？？：",saveData); 
                // })
                // 2,websocket告警上传客户端
                let websocketaf = websocketsend
                let codeaf = {}
                if (websocketaf.enabled==1) {
                  codeaf.socketname = websocketname.alarm
                  codeaf.functioncode = typeString
                  codeaf.alarmfired = true
                  codeaf.alarmrestore = false
                  codeaf.address = ipinfo.address
                  codeaf.stamp = timeaf
                  websocketaf.send(codeaf)
                  console.log('-------af,box has sent 断电检测状态 websocket message=',codeaf)
                } else {
                  console.log('-------af,box websocketsend function is not exit,please run 刷新 to reset',codeaf)
                }
                clientaf.end()
                })
                .catch((e)=>{
                  console.log('insert into power_alarm_current 错误',e)
                  clientaf.end()
                })
            }
          })
          .catch((e)=>{
            console.log('af,SELECT * from power_station_tree 错误',e)
            clientaf.end()
          })
        // client.end()
        break;
      case 0xf7:
      case 0x17:
        //console.log('box 功能码 = 17 ,port=7500已接收到设备端发送的(查询供电电压与电流)应答数据================：', msg, time);
        let msgreturn17 = {}
        // 消息处理分解
        msgreturn17.portnum = rcmsg.toString('hex').slice(22, 24);
        msgreturn17.port1v = rcmsg.toString('hex').slice(24, 28);
        msgreturn17.port1a = rcmsg.toString('hex').slice(28, 32);
        msgreturn17.port2v = rcmsg.toString('hex').slice(32, 36);
        msgreturn17.port2a = rcmsg.toString('hex').slice(36, 40);
        msgreturn17.port3v = rcmsg.toString('hex').slice(40, 44);
        msgreturn17.port3a = rcmsg.toString('hex').slice(44, 48);
        msgreturn17.port4v = rcmsg.toString('hex').slice(48, 52);
        msgreturn17.port4a = rcmsg.toString('hex').slice(52, 56);
        msgreturn17.port5v = rcmsg.toString('hex').slice(56, 60);
        msgreturn17.port5a = rcmsg.toString('hex').slice(60, 64);
       
        msgreturn17.address = ipinfo.address
        let date17 = new Date()
        let year17 = date17.getFullYear() 
        let month17 =  date17.getMonth()+1 
        let day17 = date17.getDate()
        let hour17 =  date17.getHours() 
        let minute17 = date17.getMinutes()
        let second17 = date17.getSeconds()
        let time17 = year17 + '-' + String(month17 >9?month17:("0"+month17)) + '-' + String(day17 >9?day17:("0"+day17)) + ' ' +  String(hour17 >9?hour17:("0"+hour17)) + ':' + String(minute17 >9?minute17:("0"+minute17)) + ':' + String(second17 >9?second17:("0"+second17)) 
        msgreturn17.time = time17
        let websoketMsgf7 = msgreturn17
        msgreturn17 = JSON.stringify(msgreturn17)
        // end 消息处理分解
        // 超时处理
        let key17 = ipinfo.address + typeString
        console.log("box 0x17 key17：", key17);
        let res17 = {
          token: key17,
          msg: msgreturn17
        }
        let req17 = promisePool[key17]
        if (req17) {
          req17.resolve(res17);
          clearTimeout(req17.timer);
          console.log("========= box 0x17收到正确应答消息========，token=", key17);
          delete promisePool[key17];
        } else {
          console.log("==================box 0xf7 主动上传供电电压与电流,或者17消息过期或不明消息========", key17);
          let websocketf7 = websocketsend
          let codef7 = {}
          if (websocketf7.enabled==1) {
            codef7.socketname = websocketname.va
            codef7.functioncode = typeString
            codef7.portnum = websoketMsgf7.portnum
            codef7.port1v = websoketMsgf7.port1v
            codef7.port1a = websoketMsgf7.port1a
            codef7.port2v = websoketMsgf7.port2v
            codef7.port2a = websoketMsgf7.port2a
            codef7.port3v = websoketMsgf7.port3v
            codef7.port3a = websoketMsgf7.port3a
            codef7.port4v = websoketMsgf7.port4v
            codef7.port4a = websoketMsgf7.port4a
            codef7.port5v = websoketMsgf7.port5v
            codef7.port5a = websoketMsgf7.port5a
            codef7.address = websoketMsgf7.address
            codef7.stamp = time17
            websocketf7.send(codef7)
            console.log('-------box has sent 供电电压与电流 websocket message=',codef7)
          } else {
            console.log('-------box websocketsend function is not exit,please run 刷新 to reset',codef7)
            }
          // 电压电流写入数据库
          // 1,查询当前告警的catalogid
        const client17 = new Client({
          user: 'postgres',
          host: '127.0.0.1',
          database: 'power',
          password: 'shyh2017',
          port: 5432,
        })
        client17.connect()
        let catalogid17 = ''
        let label17 = ''
        let saveData17 = {
          id: '',
          catalogid: catalogid17,
          code: label17,
          devicetype: '02',
          mudtype: '07',
          offline: '',
          shutdown: '',
          ov: '',
          oa: '',
          v: '',
          a: '',
          kw: '',
          onoffstatus: '',
          ipaddress: ipinfo.address,
          timestamp: time17,
          addinfo: ''
        }
          client17.query('SELECT * from power_station_tree where ipaddress =' + "'" +  ipinfo.address + "'")
          .then((res)=>{
            console.log('',res.rows)
            if (res.rowCount >0) {
              catalogid17 = res.rows[0].catalogid
              label17 = res.rows[0].label
              saveData17.id = catalogid17 + '_' + time17
              saveData17.catalogid = catalogid17
              saveData17.code = label17
              saveData17.v = websoketMsgf7.port1v
              saveData17.a = websoketMsgf7.port1a
              if (saveData17.v == '0fff') {
                saveData17.v = '0000'
              }
              if (saveData17.a == '0fff') {
                saveData17.a = '0000'
              }
              // 2,写入数据历史数据库power_box_manage
              let insertSql17 = "insert into power_box_manage (id,catalogid,code,devicetype,mudtype,offline,shutdown,ov,oa,v,a,kw,onoffstatus,ipaddress,timestamp,addinfo) \
              values ("+ "'"+saveData17.id+"'"+",\
              "+ "'"+saveData17.catalogid+"'"+",\
              "+ "'"+saveData17.code+"'"+",\
              "+ "'"+saveData17.devicetype+"'"+",\
              "+ "'"+saveData17.mudtype+"'"+",\
              "+ "'"+saveData17.offline+"'"+",\
              "+ "'"+saveData17.shutdown+"'"+",\
              "+ "'"+saveData17.ov+"'"+",\
              "+ "'"+saveData17.oa+"'"+",\
              "+ "'"+saveData17.v+"'"+",\
              "+ "'"+saveData17.a+"'"+",\
              "+ "'"+saveData17.kw+"'"+",\
              "+ "'"+saveData17.onoffstatus+"'"+",\
              "+ "'"+saveData17.ipaddress+"'"+",\
              "+ "'"+saveData17.timestamp+"'"+",\
              "+ "'"+saveData17.addinfo+"'"+")";
              //console.log(insertSql17)
              client17.query(insertSql17)
                .then((res)=>{
                //console.log("insert into power_box_man---17，新增数据库记录：",saveData17); 
                client17.end()
                })
                .catch((e)=>{
                  console.log('insert into power_box_manage 错误',e)
                  client17.end()
                })
            }
          })
          .catch((e)=>{
            console.log('17,SELECT * from power_station_tree 错误',e)
            client17.end()
          })
          // end 电压电流写入数据库
          }
        break;
      case 0xf1:
      case 0xa1:
        console.log('box 功能码 = f1 ,port=7500已接收到设备端发送的上传供电端口状态================：',msg,time);
        // 消息处理
        let msgreturnf1 = {}
        msgreturnf1.portnum = rcmsg.toString('hex').slice(22, 24);
        msgreturnf1.portstatus = rcmsg.toString('hex').slice(28, 30);
        let port1 = parseInt(msg.toString('hex').slice(28, 30), 16) & 0x01;
        msgreturnf1.port1 = (port1>0?'aa':'55')
        msgreturnf1.address = ipinfo.address
        let datef1 = new Date()
        let yearf1 = datef1.getFullYear() 
        let monthf1 =  datef1.getMonth()+1 
        let dayf1 = datef1.getDate()
        let hourf1 =  datef1.getHours() 
        let minutef1 = datef1.getMinutes()
        let secondf1 = datef1.getSeconds()
        let timef1 = yearf1 + '-' + String(monthf1 >9?monthf1:("0"+monthf1)) + '-' + String(dayf1 >9?dayf1:("0"+dayf1)) + ' ' +  String(hourf1 >9?hourf1:("0"+hourf1)) + ':' + String(minutef1 >9?minutef1:("0"+minutef1)) + ':' + String(secondf1 >9?secondf1:("0"+secondf1)) 
        msgreturnf1.time = timef1
        let websoketMsg = msgreturnf1
        msgreturnf1 = JSON.stringify(msgreturnf1)
        // end消息处理
        // 应答上传,还是主动上传?
        let keyf1 = ipinfo.address + typeString
        console.log("box 0xf1 keyf1：", keyf1);
        let resf1 = {
          token: keyf1,
          msg: msgreturnf1
        }
        let reqf1 = promisePool[keyf1]
        if (reqf1) {
          reqf1.resolve(resf1);
          clearTimeout(reqf1.timer);
          console.log("========= box 0xf1(f0)收到正确应答消息========，token=", keyf1);
          delete promisePool[keyf1];
        } else {
          console.log("=========box 0xf1 主动上传供电端口状态,或者消息过期或不明消息========", keyf1);
          let websocketf1 = websocketsend
          let codef1 = {}
          if (websocketf1.enabled==1) {
            codef1.socketname = websocketname.onoff
            codef1.functioncode = typeString
            codef1.portnum = websoketMsg.portnum
            codef1.port1 = websoketMsg.port1
            codef1.portstatus = websoketMsg.portstatus
            codef1.address = websoketMsg.address
            codef1.stamp = timef1
            websocketf1.send(codef1)
            console.log('-------box has sent 供电端口状态 websocket message=',codef1)
          } else {
            console.log('-------box websocketsend function is not exit,please run 刷新 to reset',codef1)
            }
          }
        break;
      case 0x50:
        console.log('box 功能码 = 50 ,port=7500已接收到设备端发送的重启供电端口================：',msg,time);
        // 消息处理
        let msgreturn50 = {}
        msgreturn50.portnum = rcmsg.toString('hex').slice(40, 42);
        msgreturn50.return = rcmsg.toString('hex').slice(34, 36);
        msgreturn50.address = ipinfo.address
        let date50 = new Date()
        let year50 = date50.getFullYear() 
        let month50 =  date50.getMonth()+1 
        let day50 = date50.getDate()
        let hour50 =  date50.getHours() 
        let minute50 = date50.getMinutes()
        let second50 = date50.getSeconds()
        let time50 = year50 + '-' + String(month50 >9?month50:("0"+month50)) + '-' + String(day50 >9?day50:("0"+day50)) + ' ' +  String(hour50 >9?hour50:("0"+hour50)) + ':' + String(minute50 >9?minute50:("0"+minute50)) + ':' + String(second50 >9?second50:("0"+second50)) 
        msgreturn50.time = time50
        msgreturn50 = JSON.stringify(msgreturn50)
        // end消息处理
        // 应答上传,还是主动上传?
        let key50 = ipinfo.address + typeString
        console.log("box 0x50 key50：", key50);
        let res50 = {
          token: key50,
          msg: msgreturn50
        }
        let req50 = promisePool[key50]
        if (req50) {
          req50.resolve(res50);
          clearTimeout(req50.timer);
          console.log("========= box 0x50收到正确应答消息========，token=", key50);
          delete promisePool[key50];
        } else {
          console.log("=========box 0x50 主动上传:重启供电端口,或者消息过期或不明消息========", key50);
          }
        break;
      case 0x51:
        console.log('box 功能码 = 51 ,port=7500已接收到设备端发送的断开供电端口================：',msg,time);
        // 消息处理
        let msgreturn51 = {}
        msgreturn51.portnum = rcmsg.toString('hex').slice(40, 42);
        msgreturn51.return = rcmsg.toString('hex').slice(34, 36);
        msgreturn51.address = ipinfo.address
        let date51 = new Date()
        let year51 = date51.getFullYear() 
        let month51 =  date51.getMonth()+1 
        let day51 = date51.getDate()
        let hour51 =  date51.getHours() 
        let minute51 = date51.getMinutes()
        let second51 = date51.getSeconds()
        let time51 = year51 + '-' + String(month51 >9?month51:("0"+month51)) + '-' + String(day51 >9?day51:("0"+day51)) + ' ' +  String(hour51 >9?hour51:("0"+hour51)) + ':' + String(minute51 >9?minute51:("0"+minute51)) + ':' + String(second51 >9?second51:("0"+second51)) 
        msgreturn51.time = time51
        msgreturn51 = JSON.stringify(msgreturn51)
        // end消息处理
        // 应答上传,还是主动上传?
        let key51 = ipinfo.address + typeString
        console.log("box 0x51 key51：", key51);
        let res51 = {
          token: key51,
          msg: msgreturn51
        }
        let req51 = promisePool[key51]
        if (req51) {
          req51.resolve(res51);
          clearTimeout(req51.timer);
          console.log("========= box 0x51收到正确应答消息========，token=", key51);
          delete promisePool[key51];
        } else {
          console.log("=========box 0x51 主动上传:重启供电端口,或者消息过期或不明消息========", key51);
          }
        break;
      case 0x52:
        console.log('box 功能码 = 52 ,port=7500已接收到设备端发送的吸合供电端口================：',msg,time);
        // 消息处理
        let msgreturn52 = {}
        msgreturn52.portnum = rcmsg.toString('hex').slice(40, 42);
        msgreturn52.return = rcmsg.toString('hex').slice(34, 36);
        msgreturn52.address = ipinfo.address
        let date52 = new Date()
        let year52 = date52.getFullYear() 
        let month52 =  date52.getMonth()+1 
        let day52 = date52.getDate()
        let hour52 =  date52.getHours() 
        let minute52 = date52.getMinutes()
        let second52 = date52.getSeconds()
        let time52 = year52 + '-' + String(month52 >9?month52:("0"+month52)) + '-' + String(day52 >9?day52:("0"+day52)) + ' ' +  String(hour52 >9?hour52:("0"+hour52)) + ':' + String(minute52 >9?minute52:("0"+minute52)) + ':' + String(second52 >9?second52:("0"+second52)) 
        msgreturn52.time = time52
        msgreturn52 = JSON.stringify(msgreturn52)
        // end消息处理
        // 应答上传,还是主动上传?
        let key52 = ipinfo.address + typeString
        console.log("box 0x52 key52：", key52);
        let res52 = {
          token: key52,
          msg: msgreturn52
        }
        let req52 = promisePool[key52]
        if (req52) {
          req52.resolve(res52);
          clearTimeout(req52.timer);
          console.log("========= box 0x52收到正确应答消息========吸合，token=", key52);
          delete promisePool[key52];
        } else {
          console.log("=========box 0x52 主动上传:吸合供电端口,或者消息过期或不明消息========", key52);
          }
        break;
        // msg process
      default:
        console.log('default port=7500已接收到：', commType,time);
    }
  }
})
server.on("listening", function () {
    let address = server.address();
    console.log("box socket服务器开始监听。地址信息为", address);
});
// power ac service
class PoweracService extends Service {
  
  // getacparamfromagent
  async getacparamfromagent(catalogid) {
    return deviceParams[catalogid]
  }
   // getacparamfromdevice
  async getvafromdevice(catalogid) {
    let resultArr = [0x7d,0x01,0x17,0,0x04,0,0,0,0,0x99,0x0d];
    return 1
  }
  // SetParamsTBox
  async agentAcProcessSetParams(params, catalogid) {
    // 1,restore
    let json = JSON.parse(params.result)
    this.ctx.service.powerac.agentAcProcessCheckAlarmRestore(json, catalogid)
    // 2,更新内存数据区
    deviceParams[catalogid] = params.result
    // console.log('内存设备参数区', deviceParams[catalogid])
  }
  // get session ID
  async getSessionID() {
    if (session > 65535)
      session = 0;
      session = session + 1
      return session
  }
    //从当前更新表
    async getAlarmTable() {
        let i
        let numbersCopy = [];
        for (i = 0; i < sTable.length; i++) {
            numbersCopy[i] = sTable[i];
        }
        // console.log("getAlarmTable获取alarm表", numbersCopy);
        //清空中间表和更新标志
        sTable = [];
        // tableIsChangded = false;
        return numbersCopy;

    }
    //send sw msg
    async sendMsg(msg, powerip) {
        let buf = new Buffer.from(msg)
        let returncode = 0;
        await server.send(buf, 0, buf.length, 7400, powerip, function (err, bytes) {
            returncode = err
            if (err) {
                console.log('send data err')
            } else {
                console.log("send data ok:", bytes)
            }
        });
        //server.send(buf, 0, buf.length, 7000, "192.168.1.145");
        console.log("给socket发送的请求命令数据为：" + buf.toString('hex'))
        return returncode;
    }
    //async send msg promise
    async sendMsgPromiseTimeout(token0, msg, powerip) {
        // start emit in server.on
        let that = this
        if (heartbeat == 0 ) {
          heartbeat = 11
          // 
          websocketsend = {
            enabled:1,
            send:(e)=>{
                    console.log("执行了box websocket通知=:",e)
                    that.app.io.emit(e.socketname,{code:e})
                }
          }
          console.log('websocketsend has init,message can be send to websocket client!!!!!!\n',websocketsend)
          let code = {} 
          code.socketname = websocketname.test
          code.test = 'this is websocket test info ,websocketsend is init ok!!!!!!'
          websocketsend.send(code)
        }
        // send msg to device
        let buf = new Buffer.from(msg)
        let returncode = 0
        server.send(buf, 0, buf.length, 7500, powerip, function (err, bytes) {
            returncode = err
            if (err) {
                console.log('powerbox send data err');
            } else {
                console.log("powerbox send data length=:", bytes,buf);
            }
        });
        // return promise
        let token = powerip + token0
        console.log("powerbox send data current token=:", token);
        let timer = null
        let err = {
            token: token
        }
        return Promise.race([
            new Promise((resolve, reject) => {
                //console.log('本次token=', token)
                timer = setTimeout(() => {
                    console.log('powerbox 本次消息请求，超时未收到应答,token =', token)
                    reject(err)
                }, 1000)
            }), new Promise((resolve, reject) => {
                promisePool[token] = {
                    token,
                    resolve,
                    reject,
                    timer
                }
            })
        ])
    }
}
module.exports = PoweracService;

