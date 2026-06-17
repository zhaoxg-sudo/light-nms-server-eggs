const Service = require('egg').Service;
const { Pool, Client } = require('pg')
const dgram = require('dgram')
const server = dgram.createSocket('udp4');
let promisePool = [];
let clsdPort = 7300
const  websocketname = {
    tset: "test",
    clsdonoff: "clsdonoff",
    alarm: "alarm"
  }
  global.websocketsend = {}
  global.gProtocoltype = '08'
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
            console.log('cls-d 发生了离线告警______________________________', heartbeatlist[i])
            heartbeatlist[i].times = 0
            heartbeatlist[i].alarmfired = true
            heartbeatlist[i].alarmfiredtime = timeoffline
            // set offline status in heartbeatlist
            heartbeatlist[i].alarmofflinefired = true
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
              console.log('cls-d updateTimer,SELECT * from power_station_tree  ',res.rows)
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
                    codeoffline.catalogid = catalogid
                    codeoffline.protocoltype = gProtocoltype
                    codeoffline.functioncode = 'offline'
                    codeoffline.alarmfired = true
                    codeoffline.alarmrestore = false
                    codeoffline.address = heartbeatlist[i].alarmip
                    codeoffline.stamp = timeoffline
                    websocketoffline.send(codeoffline)
                    console.log('-------updateTimer,cls-d has sent 离线告警 websocket message=',codeoffline)
                  } else {
                    console.log('-------updateTimer,cls-d websocketsend function is not exit,please run 刷新 to reset',codeoffline)
                  }
                  // clientoffline.end()
                  })
                  .catch((e)=>{
                    console.log('cls-d updateTimer,insert into power_alarm_current 错误',e)
                    // clientoffline.end()
                  })
              }
            })
            .catch((e)=>{
              console.log('cls-d updateTimer,SELECT * from power_station_tree 错误',e)
              // clientaf.end()
            })
            // end 离线告警处理
          } else {
            console.log('cls-d 已经发生了离线告警,但是还未恢复______________________________', heartbeatlist[i])
            heartbeatlist[i].times = 0
          }
        }
      }
    }
  }, 4000)
  const clientheart = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'power',
    password: 'shyh2017',
    port: 5432,
  })
  clientheart.connect()
  let protocoltype = '8'
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
            alarmip: '',
            alarmcatalogid: '',
            alarmofflinefired: false,
            alarmshutdownfired: false
          }
          deviceoffline[i].alarmip = joindevice[i].ipaddress
          deviceoffline[i].alarmcatalogid = joindevice[i].catalogid
          heartbeatlist.push(deviceoffline[i])
        }
      }
      clientheart.end()
    })
    .catch((e)=>{
      console.log('cls-d clientheart 查询当前告警数据库错误',e)
      clientheart.end()
    })
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
    runtime: '00000000',
    timeout: true,
    com: true,
    offline: false,
    inv: "0000",
    outv: "0000",
    outw: "0000",
    temperature: "0000",
    runstatus: "0000",
    alarm: "00",
    outswitch : "0000",
    time: "2025-04-07 09:41:56",
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
server.bind(clsdPort, '0.0.0.0');
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
  console.log('port=7300已接收到设备端发送的数据：' + msg.toString('hex'));
  console.log("cls-d,port=7300,收到数据的设备端地址信息为：", rinfo);
  let commType = parseInt(msg.toString('hex').slice(2, 4), 16);
  let typeString = msg.toString('hex').slice(2, 4)
  let commSubType = parseInt(msg.toString('hex').slice(4, 6), 16);
  //接收到消息处理
  if (startRecDataFlag) {
    switch (commType) {
      case 0x07:
        let ip00 = ipinfo.address
        if (commSubType == 0x00) {
          console.log("cls-d,port=7300  收到心跳信息为：", rcmsg);
          if (heartbeatlist instanceof Array) {
            for (let i = 0; i < heartbeatlist.length; i++) {
              if (heartbeatlist[i].alarmip == ip00) {
                heartbeatlist[i].times = 0
                // A offline告警恢复处理
                heartbeatlist[i].alarmofflinefired = false
                heartbeatlist[i].alarmshutdownfired = false
                if (heartbeatlist[i].alarmfired) {
                  console.log('cls-d 发生了告警恢复：', heartbeatlist[i])
                  heartbeatlist[i].alarmrestore = true
                  heartbeatlist[i].alarmfired = false
                  // heartbeatlist[i].alarmofflinefired = false
                  // heartbeatlist[i].alarmshutdownfired = false
                  heartbeatlist[i].alarmrestoretime = time
                  heartbeatlist[i].alarmip = ip00
                  console.log('cls-d 发生了告警恢复后：', heartbeatlist[i])
                  // 告警数据库处理,将当前告警数据库,移到历史告警数据库
                  // A end offline告警恢复处理
                  // 1,数据库查询有无本IP的断电当前告警,有->处理'断电告警'告警恢复
                let alalrmoffline = 'offline'
                let currentAlarmOffline
                client00.query('SELECT * from power_alarm_current where alarmsourceip =' + "'" +  ipinfo.address + "'" + " and alarmdetail = " + "'" + alalrmoffline + "'")
                  .then((res)=>{
                    if (res.rowCount >0) {
                      console.log('cls-d 当前告警中,offline,但是还未恢复',res.rows,ipinfo.address)
                      // 0,发送告警恢复websocket
                      currentAlarmOffline = res.rows[0]
                      let catalogid = res.rows[0].catalogid
                      let websocketofflinerestore = websocketsend
                      let code00restore = {}
                      if (websocketofflinerestore.enabled==1) {
                        code00restore.socketname = websocketname.alarm
                        code00restore.catalogid = catalogid
                        code00restore.protocoltype = gProtocoltype
                        code00restore.functioncode = 'offline'
                        code00restore.alarmfired = false
                        code00restore.alarmrestore = true
                        code00restore.address = ipinfo.address
                        code00restore.stamp = time
                        websocketofflinerestore.send(code00restore)
                        console.log('-------offline,cls-d has sent 离线:告警恢复 websocket message=',code00restore)
                      } else {
                        console.log('-------offline 告警恢复,cls-d websocketsend function is not exit,please run 刷新 to reset',codeafrestore)
                      }
                      // 1,在当前告警数据库中删除offline
                      client00.query('DELETE from power_alarm_current where alarmsourceip =' + "'" +  ipinfo.address + "'" + " and alarmdetail = " + "'" + alalrmoffline + "'")
                      .then((s)=>{
                        console.log('cls-d offline 当前告警 删除',s.rows,ipinfo.address)
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
                            console.log('cls-d offline 历史告警添加成功',e.rows,ipinfo.address)
                            // client00.end()
                            })
                            .catch((e)=>{
                              console.log('cls-d offline 历史告警添加数据库错误',e)
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
                      console.log('clsd 当前告警中,查询到存在告警shutdown,但是还未恢复',res.rows,ipinfo.address)
                      // 0,发送告警恢复websocket
                      let currentAlarm = res.rows[0]
                      let catalogid = res.rows[0].catalogid
                      let websocketafrestore = websocketsend
                      let codeafrestore = {}
                      if (websocketafrestore.enabled==1) {
                        codeafrestore.socketname = websocketname.alarm
                        codeafrestore.catalogid = catalogid
                        codeafrestore.protocoltype = gProtocoltype
                        codeafrestore.functioncode = 'shutdown'
                        codeafrestore.alarmfired = false
                        codeafrestore.alarmrestore = true
                        codeafrestore.address = ipinfo.address
                        codeafrestore.stamp = time
                        websocketafrestore.send(codeafrestore)
                        console.log('-------shutdown,cls-d has sent 断电检测状态:告警恢复 websocket message=',codeafrestore)
                      } else {
                        console.log('-------shutdown 告警恢复,cls-d websocketsend function is not exit,please run 刷新 to reset',codeafrestore)
                      }
                      // 1,在当前告警数据库中删除
                      client00.query('DELETE from power_alarm_current where alarmsourceip =' + "'" +  ipinfo.address + "'" + " and alarmdetail = " + "'" + alalrmdetail + "'")
                      .then((s)=>{
                        console.log('clsd shutdown 当前告警 删除',s.rows,ipinfo.address)
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
                            console.log('clsd shutdown 历史告警添加成功',e.rows,ipinfo.address)
                            // client00.end()
                            })
                            .catch((e)=>{
                              console.log('clsd shutdown 历史告警添加数据库错误',e)
                              // client00.end()
                            })
                      })
                      .catch((e)=>{
                        console.log('clsd shutdown 当前告警 删除错误',e)
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
        } else if (commSubType == 0x10) {
            console.log("cls-d,port=7300  收到掉电报警信息为：", rcmsg);
            // 时间间隔小于3秒的告警
            let dateaf = new Date()
            let yearaf = dateaf.getFullYear() 
            let monthaf =  dateaf.getMonth()+1 
            let dayaf = dateaf.getDate()
            let houraf =  dateaf.getHours() 
            let minuteaf = dateaf.getMinutes()
            let secondaf = dateaf.getSeconds()
            let timeaf = yearaf + '-' + String(monthaf >9?monthaf:("0"+monthaf)) + '-' + String(dayaf >9?dayaf:("0"+dayaf)) + ' ' +  String(houraf >9?houraf:("0"+houraf)) + ':' + String(minuteaf >9?minuteaf:("0"+minuteaf)) + ':' + String(secondaf >9?secondaf:("0"+secondaf)) 
            // 0,set shutdown status in heartbeatlist
            let ip10 = ipinfo.address
            if (heartbeatlist instanceof Array) {
              for (let i = 0; i < heartbeatlist.length; i++) {
                if (heartbeatlist[i].alarmip == ip10) {
                  heartbeatlist[i].alarmshutdownfired = true
                }
              }
            }
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
                      codeaf.catalogid = catalogid
                      codeaf.protocoltype = gProtocoltype
                      codeaf.functioncode = typeString
                      codeaf.alarmfired = true
                      codeaf.alarmrestore = false
                      codeaf.address = ipinfo.address
                      codeaf.stamp = timeaf
                      websocketaf.send(codeaf)
                      console.log('-------clsd has sent 断电检测状态 websocket message=',codeaf)
                    } else {
                      console.log('-------clsd websocketsend function is not exit,please run 刷新 to reset',codeaf)
                    }
                    clientaf.end()
                    })
                    .catch((e)=>{
                      console.log('clsd insert into power_alarm_current 错误',e)
                      clientaf.end()
                    })
                }
              })
              .catch((e)=>{
                console.log('07 10,SELECT * from power_station_tree 错误',e)
                clientaf.end()
              })
        } else {

        }
      break;
      case 0x03:
        console.log('cls-d port=7300已接收到设备端发送的应答数据：' + msg.toString('hex'));
        // return msg process
        let returnmsg = {}
        let runtime = rcmsg.toString('hex').slice(14, 22);
        returnmsg.runtime = runtime
        let inv = rcmsg.toString('hex').slice(22, 26);
        returnmsg.inv = inv
        let outv = rcmsg.toString('hex').slice(30, 34);
        returnmsg.outv = outv
        let outw = rcmsg.toString('hex').slice(42, 46);
        returnmsg.outw = outw
        let temperature = rcmsg.toString('hex').slice(46, 50);
        returnmsg.temperature = temperature
        let runstatus= rcmsg.toString('hex').slice(62, 64);
        returnmsg.runstatus = runstatus
        let alarm = rcmsg.toString('hex').slice(64, 66);
        returnmsg.alarm = alarm
        let outswitch = rcmsg.toString('hex').slice(66, 70);
        returnmsg.outswitch = outswitch
        let date03 = new Date()
        let year03 = date03.getFullYear() 
        let month03 =  date03.getMonth()+1 
        let day03 = date03.getDate()
        let hour03 =  date03.getHours() 
        let minute03 = date03.getMinutes()
        let second03 = date03.getSeconds()
        let time03 = year03 + '-' + String(month03 >9?month03:("0"+month03)) + '-' + String(day03 >9?day03:("0"+day03)) + ' ' +  String(hour03 >9?hour03:("0"+hour03)) + ':' + String(minute03 >9?minute03:("0"+minute03)) + ':' + String(second03 >9?second03:("0"+second03)) 
        returnmsg.time = time03
        returnmsg.ipaddress = ipinfo.address
        returnmsg.com = false
        returnmsg.offline = false
        returnmsg.shutdown = false
        returnmsg.timeout = false
        //console.log('cls-d port=7300已接收到设备端发送的应答数据,处理后：',returnmsg);
        msg = JSON.stringify(returnmsg)
        // let key = 0x04;
        let key = ipinfo.address + typeString
        // key = '192.168.1.171'
        let res = {
          token: key,
          msg: msg
        }
        let req = promisePool[key]
        if (req) {
          req.resolve(res);
          clearTimeout(req.timer);
          // console.log("=========cls-d 0x03收到正确应答消息========，token=", key);
          delete promisePool[key];
        } else {
          console.log("=========cls-d 0x03消息过期或不明消息========", key);
          }
      break;
      case 0x05:
        console.log('clsd 功能码 = 05 ,port=7300已接收到设备端发送的重启供电端口的应答信息================：',msg,time);
        // 消息处理
        let msgreturn05 = {}
        msgreturn05.portnum = rcmsg.toString('hex').slice(4, 8);
        msgreturn05.return = rcmsg.toString('hex').slice(8, 12);
        msgreturn05.address = ipinfo.address
        let date05 = new Date()
        let year05 = date05.getFullYear() 
        let month05 =  date05.getMonth()+1 
        let day05 = date05.getDate()
        let hour05 =  date05.getHours() 
        let minute05 = date05.getMinutes()
        let second05 = date05.getSeconds()
        let time05 = year05 + '-' + String(month05 >9?month05:("0"+month05)) + '-' + String(day05 >9?day05:("0"+day05)) + ' ' +  String(hour05 >9?hour05:("0"+hour05)) + ':' + String(minute05 >9?minute05:("0"+minute05)) + ':' + String(second05 >9?second05:("0"+second05)) 
        msgreturn05.time = time05
        msgreturn05 = JSON.stringify(msgreturn05)
        // end消息处理
        // 应答上传,还是主动上传?
        let key05 = ipinfo.address + typeString
        console.log("clsd 0x05 key05：", key05);
        let res05 = {
          token: key05,
          msg: msgreturn05
        }
        let req05 = promisePool[key05]
        if (req05) {
          req05.resolve(res05);
          clearTimeout(req05.timer);
          console.log("========= clsd 0x05收到正确应答消息========，token=", key05);
          delete promisePool[key05];
        } else {
          console.log("=========clsd 0x05 主动上传:重启供电端口,或者消息过期或不明消息========", key05);
          }
        break;
        case 0x50:
          console.log('clsd 功能码 = 50 ,port=7300已接收到设备端发送的供电端口状态变化的的主动推送信息================：',msg,time);
          // 消息处理
          let msgreturn50 = {}
          msgreturn50.outswitch = rcmsg.toString('hex').slice(6, 10);
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
          let msgTem = msgreturn50
          msgreturn50 = JSON.stringify(msgreturn50)
          // end消息处理
          // 应答上传,还是主动上传?
          let key50 = ipinfo.address + typeString
          console.log("clsd 0x50 key50：", key50);
          let res50 = {
            token: key50,
            msg: msgreturn50
          }
          let req50 = promisePool[key50]
          if (req50) {
            req50.resolve(res50);
            clearTimeout(req50.timer);
            console.log("========= clsd 0x50收到正确应答消息========，token=", key50);
            delete promisePool[key50];
          } else {
            console.log("=========clsd 0x50 主动上传:供电端口状态变化==", res50);
            // 1,查询当前告警的catalogid
            const client50 = new Client({
              user: 'postgres',
              host: '127.0.0.1',
              database: 'power',
              password: 'shyh2017',
              port: 5432,
            })
            client50.connect()
            // 2,获取catalog id
            client50.query('SELECT * from power_station_tree where ipaddress =' + "'" +  ipinfo.address + "'")
              .then((res)=>{
                console.log('',res.rows)
                if (res.rowCount >0) {
                  let catalogid = res.rows[0].catalogid
                  // 3,推送输出开关通断变化消息
                  let websocket50 = websocketsend
                  let code50 = {}
                  if (websocket50.enabled==1) {
                    code50.socketname = websocketname.clsdonoff
                    code50.catalogid = catalogid
                    code50.protocoltype = gProtocoltype     
                    code50.functioncode = typeString
                    code50.outswitch = msgTem.outswitch
                    code50.address = msgTem.address
                    code50.stamp = time50
                    websocket50.send(code50)
                    console.log('-------clsd has sent 供电端口状态 websocket message=',code50)
                  } else {
                    console.log('-------clsd websocketsend function is not exit,please run 刷新 to reset',code50)
                  }
                }
                client50.end()
              })
              .catch((e)=>{
                console.log('clsd insert into power_alarm_current 错误',e)
                client50.end()
              })
            }
          break;
    }
  }
})
server.on("listening", function () {
    let address = server.address();
    console.log("cls-d,socket服务器开始监听。地址信息为", address);
});
// power clsd service
class PowerclsdService extends Service {
  // save data to db
  async saveAcClsdParams() {
    // 读取设备列表
    let deviceList = await this.ctx.service.db.getAllDeviceListByType(8)
    console.log("saveAcClsdParams:从数据库读取的deviceList",deviceList);
    this.ctx.service.powerclsd.saveAcClsdData(deviceList)
    return 0
  }
  // saveAcAbData
  async saveAcClsdData(list) {
    for (let i = 0; i < list.length; i++) {
      let saveData = {}
      let deviceData = JSON.parse(deviceParams[list[i].catalogid])
      console.log("clsd saveAcAbData:要插入data数据库的原始设备数据",deviceData)
      saveData.id = list[i].catalogid + '_' + deviceData.time
      saveData.catalogid = list[i].catalogid
      saveData.devicetype = list[i].protocoltype
      saveData.code = list[i].label
      saveData.mudtype = '0008'
      saveData.addinfo = '00'
      saveData.timestamp = deviceData.time
      saveData = Object.assign(saveData,deviceData)
      console.log("clsd saveAcAbData:要插入data数据库的数据",saveData)
      this.ctx.service.db.insertClsdDataIntoDB(saveData)
    }
  }
  // getclsdparamfromagent
  async getclsdparamfromagent(catalogid) {
    return deviceParams[catalogid]
  }
  // translate to aLarm
  translateToALarm(a, catalogid) {
    let alarmdetail = {}
    // console.log('clsd 收到的alarm原始值:=', a)
    a = parseInt(a, 16)
    let inuvbit = ((a & 0x01) === 0x01)
    alarmdetail.nuv = inuvbit
    let inovbit = ((a & 0x02) === 0x02)
    alarmdetail.inov = inovbit
    let owbit = ((a & 0x04) === 0x04)
    alarmdetail.ow = owbit
    let otbit = ((a & 0x08) === 0x08)
    alarmdetail.ot = otbit
    let oloadbit = ((a & 0x10) === 0x10)
    alarmdetail.oload = oloadbit
    let outuvbit = ((a & 0x20) === 0x20)
    alarmdetail.outuv = outuvbit
    let outovbit = ((a & 0x40) === 0x40)
    alarmdetail.outov = outovbit
    let masterswbit = ((a & 0x80) === 0x80)
    alarmdetail.mastersw = masterswbit
    // add shutdown,offline alarm status
    if (heartbeatlist instanceof Array) {
      for (let i = 0; i < heartbeatlist.length; i++) {
        if (heartbeatlist[i].alarmcatalogid == catalogid) {
          alarmdetail.offline = heartbeatlist[i].alarmofflinefired
          alarmdetail.shutdown = heartbeatlist[i].alarmshutdownfired
        }
      }
    }
    // console.log('clsd 收到的alarm原始值转化为:=', alarmdetail)
    return alarmdetail
  }
  // agentAcProcessSetParams
  async agentAcClsdProcessSetParams(params, catalogid) {
    // 1,restore
    let json = JSON.parse(params.result)
    // 3,translate to aLarm
    let alarmdetail = this.ctx.service.powerclsd.translateToALarm(json.alarm, catalogid)
    let alarm = JSON.parse(params.result)
    alarm.offline = alarmdetail.offline
    alarm.shutdown = alarmdetail.shutdown
    alarmdetail.com = json.com
    alarmdetail.offline = json.offline
    alarmdetail.time = json.time
    alarmdetail.timeout = json.timeout
    // console.log('clsd agentAcClsdProcessSetParams alarmdetail:=', alarmdetail)
    this.ctx.service.powerclsd.agentAcClsdProcessCheckAlarmRestore(alarmdetail, catalogid)
    // 2,更新内存数据区
    let paramsAdd = JSON.stringify(alarm)
    deviceParams[catalogid] = params.result
    deviceParams[catalogid] = paramsAdd
    // console.log('agentAcClsdProcessSetParams,内存设备参数区:=', catalogid, deviceParams[catalogid])
  }
  // agentAcProcessCheckAlarmRestore
  async agentAcClsdProcessCheckAlarmRestore(params, catalogid) {
    this.ctx.service.db.readAllCurrentAlarm()
      .then((e)=>{
        // console.log('agentAcProcessCheckAlarmRestore返回当前告警数据库：\n', e)
        let table = []
        if (e.length > 0) {
          table = e
          // console.log('agentAcProcessCheckAlarmRestore当前告警数据库：\n', table, catalogid)
          // 检查告警恢复
          this.ctx.service.powerclsd.agentAcClsdProcessCheckRestote(e, catalogid, params)
        } else console.log('agentAcClsdProcessCheckAlarmRestore 没有当前告警：', e)
      })
  }
  // agentAcProcessCheckRestote
  async agentAcClsdProcessCheckRestote(table, catalogid, params) {
    // alarm restore check
    // console.log('agentAcProcessCheckRestote当前告警数据库：\n', table, catalogid)
    for (let i = 0; i < table.length; i++) {
      if (table[i].alarmmudid === catalogid) {
        // console.log('agentAcProcessCheckRestote发现当前告警记录已存在..\n', table[i], catalogid, params)
        this.ctx.service.powerclsd.alarmRestoreCheck(table[i], catalogid, params)
      }
    }
  }
  // alarmRestoreCheck
  async alarmRestoreCheck (oldAlarm, catalogid, nowParams) {
    let restoredTable = []
      let arrayData = new Array(13)
      // console.log('alarmRestoreCheck', oldAlarm, nowParams)
      for (let i = 0; i < 13; i++) {
        arrayData[i] = {
          alarmid: '',
          alarmmudid: catalogid,
          alarmdetail: '',
          alarmfired: false,
          alarmrestoreflag: false,
          alarmrestoreinfo: ''
        }
      }
      if (oldAlarm.alarmdetail === 'com' && nowParams.com === false) {
        arrayData[12].alarmdetail = 'com'
        arrayData[12].alarmid = oldAlarm.alarmid
        arrayData[12].alarmrestoreflag = true
        arrayData[12].alarmrestoreinfo = nowParams.time
        restoredTable.push(arrayData[12])
      } else {
        if (oldAlarm.alarmdetail === 'mastersw' && nowParams.mastersw === false && nowParams.timeout === false) {
          arrayData[0].alarmdetail = 'mastersw'
          arrayData[0].alarmid = oldAlarm.alarmid
          arrayData[0].alarmrestoreflag = true
          arrayData[0].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[0])
        }
        if (oldAlarm.alarmdetail === 'outov' && nowParams.outov === false && nowParams.timeout === false) {
          arrayData[1].alarmdetail = 'outov'
          arrayData[1].alarmid = oldAlarm.alarmid
          arrayData[1].alarmrestoreflag = true
          arrayData[1].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[1])
        }
        if (oldAlarm.alarmdetail === 'outuv' && nowParams.outuv === false && nowParams.timeout === false) {
          arrayData[2].alarmdetail = 'outuv'
          arrayData[2].alarmid = oldAlarm.alarmid
          arrayData[2].alarmrestoreflag = true
          arrayData[2].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[2])
        }
        if (oldAlarm.alarmdetail === 'oload' && nowParams.oload === false && nowParams.timeout === false) {
          arrayData[3].alarmdetail = 'oload'
          arrayData[3].alarmid = oldAlarm.alarmid
          arrayData[3].alarmrestoreflag = true
          arrayData[3].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[3])
        }
        if (oldAlarm.alarmdetail === 'ot' && nowParams.ot === false && nowParams.timeout === false) {
          arrayData[4].alarmdetail = 'ot'
          arrayData[4].alarmid = oldAlarm.alarmid
          arrayData[4].alarmrestoreflag = true
          arrayData[4].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[4])
        }
        if (oldAlarm.alarmdetail === 'ow' && nowParams.ow === false) {
          arrayData[5].alarmdetail = 'ow'
          arrayData[5].alarmid = oldAlarm.alarmid
          arrayData[5].alarmrestoreflag = true
          arrayData[5].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[5])
        }
        if (oldAlarm.alarmdetail === 'inov' && nowParams.inov === false && nowParams.timeout === false) {
          arrayData[6].alarmdetail = 'inov'
          arrayData[6].alarmid = oldAlarm.alarmid
          arrayData[6].alarmrestoreflag = true
          arrayData[6].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[6])
        }
        if (oldAlarm.alarmdetail === 'inuv' && nowParams.inuv === false && nowParams.timeout === false) {
          arrayData[7].alarmdetail = 'inuv'
          arrayData[7].alarmid = oldAlarm.alarmid
          arrayData[7].alarmrestoreflag = true
          arrayData[7].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[7])
        }
      }
      // 告警恢复处理流程
      if (restoredTable.length > 0) {
      // 处理告警恢复'设备应答超时，读取数据失败？？'
      // 1,当前告警转入历史告警
      // 2,向客户端发送告警恢复消息
      console.log('alarmRestoreCheck发现告警恢复', restoredTable)
      this.ctx.service.powerclsd.agentAlarmRestoreProcess(restoredTable)
      }
  }
  // agentAlarmRestoreProcess
  async agentAlarmRestoreProcess(r) {
    // console.log('agentAlarmRestoreProcess，收到了告警恢复', r)
    // alarm restore process
    if (r.length > 0) {
      for (let i = 0; i < r.length; i++) {
        // 查询当前告警
        this.ctx.service.db.getCurrentAlarmOne(r[i].alarmid)
          .then((res) => {
          console.log('\nclsd agentAlarmRestoreProcess当前告警查询结果:')
          console.log(res)
          // 0,推送告警恢复
          let codecyclealarm = {}
          codecyclealarm.socketname = websocketname.alarm
          codecyclealarm.catalogid = r[i].alarmmudid
          codecyclealarm.protocoltype = gProtocoltype
          codecyclealarm.functioncode = r[i].alarmdetail
          codecyclealarm.alarmfired = false
          codecyclealarm.alarmrestore = true
          codecyclealarm.address = ''
          codecyclealarm.stamp = r[i].alarmrestoreinfo
          // websocketCycleAlarm.send(codeoffline)
          console.log('-------agentAlarmRestoreProcess,cls-d has sent codecyclealarm websocket message=',codecyclealarm)
          // this.ctx.app.io.emit("alarm", JSON.stringify(codecyclealarm))
          this.ctx.app.io.emit("alarm", {code: codecyclealarm})
          // 1,当前的告警，转移到历史告警数据库
          let writeData = res[0]
          writeData.alarmrestoreflag = true
          writeData.alarmrestoreinfo = r[i].alarmrestoreinfo
          this.ctx.service.db.insertToHistoryAlarmOne(writeData)
            .then((res) => {
              console.log('\nclsd agentAlarmRestoreProcess当前告警转移到历史告警结果:')
              console.log(res)
              // 2,在当前告警数据库中删除这条告警
              let alarmid = {
              alarmid: writeData.alarmid
              }
              this.ctx.service.db.delCurrentAlarmOne(r[i].alarmid)
                .then((res) => {
                  console.log('\nclsd agentAlarmRestoreProcess删除当前告警结果:')
                  console.log(res)
              })
            })
        })
      }
    }
  }
  // agentAcProcessCheckAlarm
  async agentAcProcessCheckAlarm(params, catalogid, label) {
    let b = {}
    let alarmFired = false
    b = JSON.parse(params.result)
    let a = {}
    a = this.ctx.service.powerclsd.translateToALarm(b.alarm)
    a.com = b.com
    a.offline = b.offline
    a.time = b.time
    // console.log('clsd agentAcProcessCheckAlarm a:=', a)

    // console.log('告警监测输入的参数______________________________________________\n', a)
    
    alarmFired = (a.mastersw=== true) | (a.outov=== true) | (a.outuv=== true) | (a.oload=== true) | (a.ot=== true)| (a.ow=== true) | (a.inov=== true) | (a.inuv=== true) | (a.com=== true)
    let alarmTable0 = []
    let arrayData = new Array(13)
    for (let i = 0; i < 13; i++) {
      arrayData[i] = {
        alarmid: '',
        alarmstation: label,
        alarmmudid: catalogid,
        alarmreceivedtime: a.time,
        alarmfired: true,
        alarmfiredtime: a.time,
        alarmdetail: '',
        alarmreason: '',
        alarmlevel: '',
        alarmconfirmedflag: '',
        alarmconfirmedtime: '',
        alarmconfirmedinfo: '',
        alarmrestoreflag: '',
        alarmrestoreinfo: '',
        alarmsourceip: '',
        alarmaddition: ''
      }
    }
    if (alarmFired) {
      if (a.com === true) {
        arrayData[12].alarmdetail = 'com'
        arrayData[12].alarmid = catalogid + '_' + a.time + '_' + arrayData[12].alarmdetail
        arrayData[12].alarmStatus = true
        arrayData[12].time = a.time
        // console.log('com', arrayData[12])
        alarmTable0.push(arrayData[12])
        // console.log('com后', alarmTable0)
      }
        else {
          if (a.mastersw === true) {
            arrayData[0].alarmdetail = 'mastersw'
            arrayData[0].alarmid = catalogid + '_' + a.time + '_' + arrayData[0].alarmdetail
            arrayData[0].alarmStatus = true
            arrayData[0].time = a.time
            // console.log('mastersw', arrayData[0])
            alarmTable0.push(arrayData[0])
            // console.log('auv后', alarmTable0)
          }
          if (a.outov === true) {
            arrayData[1].alarmdetail = 'outov'
            arrayData[1].alarmid = catalogid + '_' + a.time + '_' + arrayData[1].alarmdetail
            arrayData[1].alarmStatus = true
            arrayData[1].time = a.time
            // console.log('outov', arrayData[1])
            alarmTable0.push(arrayData[1])
            // console.log('buv后', alarmTable0)
          }
          if (a.outuv === true) {
            arrayData[2].alarmdetail = 'outuv'
            arrayData[2].alarmid = catalogid + '_' + a.time + '_' + arrayData[2].alarmdetail
            arrayData[2].alarmStatus = true
            arrayData[2].time = a.time
            // console.log('outuv', arrayData[2])
            alarmTable0.push(arrayData[2])
            // console.log('cuv后', alarmTable0)
          }
          if (a.oload === true) {
            arrayData[3].alarmdetail = 'oload'
            arrayData[3].alarmid = catalogid + '_' + a.time + '_' + arrayData[3].alarmdetail
            arrayData[3].alarmStatus = true
            arrayData[3].time = a.time
            console.log('oload', arrayData[3])
            alarmTable0.push(arrayData[3])
            // console.log('aov后', alarmTable0)
          }
          if (a.ot === true) {
            arrayData[4].alarmdetail = 'ot'
            arrayData[4].alarmid = catalogid + '_' + a.time + '_' + arrayData[4].alarmdetail
            arrayData[4].alarmStatus = true
            arrayData[4].time = a.time
            console.log('ot', arrayData[4])
            alarmTable0.push(arrayData[4])
            // console.log('buv后', alarmTable0)
          }
          if (a.ow === true) {
            arrayData[5].alarmdetail = 'ow'
            arrayData[5].alarmid = catalogid + '_' + a.time + '_' + arrayData[5].alarmdetail
            arrayData[5].alarmStatus = true
            arrayData[5].time = a.time
            console.log('ow', arrayData[5])
            alarmTable0.push(arrayData[5])
            // console.log('cov后', alarmTable0)
          }
          if (a.inov === true) {
            arrayData[6].alarmdetail = 'inov'
            arrayData[6].alarmid = catalogid + '_' + a.time + '_' + arrayData[6].alarmdetail
            arrayData[6].alarmStatus = true
            arrayData[6].time = a.time
            console.log('inov', arrayData[6])
            alarmTable0.push(arrayData[6])
            // console.log('aoa后', alarmTable0)
          }
          if (a.inuv === true) {
            arrayData[7].alarmdetail = 'inuv'
            arrayData[7].alarmid = catalogid + '_' + a.time + '_' + arrayData[7].alarmdetail
            arrayData[7].alarmStatus = true
            arrayData[7].time = a.time
            console.log('inuv', arrayData[7])
            alarmTable0.push(arrayData[7])
            // console.log('boa后', alarmTable0)
          }
        }
      // console.log('clsd 查询到了告警！！！！！！！！！！\n', alarmTable0)
      this.ctx.service.powerclsd.alarmTryInsertToDB(alarmTable0)
    }
    // console.log('没有查询到告警\n', alarmTable0)
  }
  // alarmTryInsertToDB
  async alarmTryInsertToDB(alarmTable) {
    // console.log('enter alarmTryInsertToDB', alarmTable)
    for (let i = 0; i < alarmTable.length; i++) {
      this.ctx.service.db.alarmFiredCheck(alarmTable[i])
        .then((e)=>{
          // console.log('返回当前已存在的重复当前告警数据库：\n', e, i)
          if (e.length === 0) {
            // 主动上报告警
            console.log('clsd 写入当前告警数据库：\n', alarmTable[i])
            // console.log('写入当前告警数据库：\n', alarmTable[i])
            this.ctx.service.db.insertCurrentAlarmDb(alarmTable[i])
              .then((e)=>{
                // 2,websocket告警上传客户端
                // let websocketCycleAlarm = websocketsend
                let codecyclealarm = {}
                codecyclealarm.socketname = websocketname.alarm
                codecyclealarm.catalogid = alarmTable[i].alarmmudid
                codecyclealarm.protocoltype = gProtocoltype
                codecyclealarm.functioncode = alarmTable[i].alarmdetail
                codecyclealarm.alarmfired = true
                codecyclealarm.alarmrestore = false
                codecyclealarm.address = ''
                codecyclealarm.stamp = alarmTable[i].alarmfiredtime
                // websocketCycleAlarm.send(codeoffline)
                console.log('-------alarmTryInsertToDB,cls-d has sent codecyclealarm websocket message=',codecyclealarm)
                // this.ctx.app.io.emit("alarm", JSON.stringify(codecyclealarm))
                this.ctx.app.io.emit("alarm", {code: codecyclealarm})
              })
          }
        })
    }
  }
  // agentAcClsdProcess
  async agentAcClsdProcess(l) {
    // console.log('enter agentAcClsdProcess', l)
    // 读取设备数据
    let list = l
    let token = '03'
    let msg = [0x01,0x03,0x01,0x00,0x00,0x10,0x45,0xFA]
    for (let i = 0; i < list.length; i++) {
      let powerip = list[i].ipaddress
      this.ctx.service.powerclsd.sendMsgPromiseTimeout(token, msg, powerip)
          .then((e)=>{
            //console.log("agentAcClsdProcess:promise resolve 处理结束-----------------",e);
            //console.log("agentAcClsdProcess:promise resolve 错误次数-----------------",errorTimes);
            let receiveMsg = e.msg
            let code = 1
            // 删掉timeout 如果存在
            for (let ii = 0; ii < timeoutArr.length; ii++) {
              if (timeoutArr[ii].catalogid === list[i].catalogid) {
                timeoutArr[ii].times = 0
                // 删除
                console.log("cls-d agentAcProcess:删除已恢复通信的超时记录-----------------\n",timeoutArr[ii]);
                timeoutArr.splice(ii, 1)
              }
            }
            let data = {result:receiveMsg, code:code, catalogid: list[i].catalogid}
            let returnParam = data
            // agent task
            this.ctx.service.powerclsd.agentAcClsdProcessSetParams(returnParam, list[i].catalogid)
            this.ctx.service.powerclsd.agentAcProcessCheckAlarm(returnParam, list[i].catalogid, list[i].label)
            //console.log("cls-d agentAcClsdProcess returnParam",returnParam)
          })
          .catch((e)=>{
            console.log("cls-d agentAcProcess:promise reject 处理超时？？？？？？？？？",e, timeoutArr);
            let date = new Date()
            let year = date.getFullYear() 
            let month =  date.getMonth()+1 
            let day = date.getDate()
            let hour =  date.getHours() 
            let minute = date.getMinutes()
            let second = date.getSeconds()
            let time = year + '-' + String(month >9?month:("0"+month)) + '-' + String(day >9?day:("0"+day)) + ' ' +  String(hour >9?hour:("0"+hour)) + ':' + String(minute >9?minute:("0"+minute)) + ':' + String(second >9?second:("0"+second)) 
            timeOutParams.time = time
            let receiveMsg = JSON.stringify(timeOutParams)
            let code = -1
            let data = {result: receiveMsg, code: code, catalogid: list[i].catalogid}
            let returnParam = data
            this.ctx.service.powerclsd.agentAcClsdProcessSetParams(returnParam, list[i].catalogid)
            console.log(returnParam)
            // timeout peocess
            let timeout = {
              times: 0,
              catalogid: list[i].catalogid
            }
            let exist = false
            for (let j = 0; j < timeoutArr.length; j++) {
              if (timeoutArr[j].catalogid === timeout.catalogid) {
                timeoutArr[j].times = timeoutArr[j].times + 1
                exist = true
                // break
              }
              if (timeoutArr[j].times >= 5) {
                timeoutArr[j].times = 0
                this.ctx.service.powerclsd.agentAcProcessCheckAlarm(returnParam, list[i].catalogid, list[i].label)
                console.log("clsd agentAcClsdProcess:已产生通信告警\n", timeout);
              }
            }
            if (!exist) timeoutArr.push(timeout)
        })
    }
  }
    // 读取cls-d设备数据，并发现告警和告警恢复
  async getAcClsdParams() {
    // 读取设备列表
    let deviceList = await this.ctx.service.db.getAllDeviceListByType(8)
    // console.log("getAcAbParams:从数据库读取的deviceList",deviceList);
    this.ctx.service.powerclsd.agentAcClsdProcess(deviceList)
    return 0
  }
    //send sw msg
    async sendMsg(msg, powerip) {
        let buf = new Buffer.from(msg)
        let returncode = 0;
        await server.send(buf, 0, buf.length, clsdPort, powerip, function (err, bytes) {
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
                    console.log("clsd 执行了clsd websocket通知=:",e)
                    that.app.io.emit(e.socketname,{code:e})
                }
          }
          console.log('clsd websocketsend has init,message can be send to websocket client!!!!!!\n',websocketsend)
          let code = {} 
          code.socketname = websocketname.test
          code.test = 'clsd this is websocket test info ,websocketsend is init ok!!!!!!'
          websocketsend.send(code)
        }
        // send msg to device
        let buf = new Buffer.from(msg)
        let returncode = 0
        server.send(buf, 0, buf.length, clsdPort, powerip, function (err, bytes) {
            returncode = err
            if (err) {
                console.log('cls-d,send data err');
            } else {
                console.log("cls-d,send data :", buf);
            }
        });
        // return promise
        let token = powerip + token0
        console.log("cls-d,send data current token=:", token);
        let timer = null
        let err = {
            token: token
        }
        return Promise.race([
            new Promise((resolve, reject) => {
                //console.log('本次token=', token)
                timer = setTimeout(() => {
                    console.log('cls-d,本次消息请求，超时未收到应答,token =', token)
                    reject(err)
                }, 2000)
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
module.exports = PowerclsdService;

