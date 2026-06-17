const Service = require('egg').Service;
const { Pool, Client } = require('pg')
const dgram = require('dgram')
const server = dgram.createSocket('udp4');
let promisePool = [];
// let token = 0x04
let session = 0;
let _this = this;
let alarmFiredFlag = false;
let alarmTable = [];
let sTable = [];
let timeoutArr = [];
let deviceParams = [];
let errorTimes = 0;
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
    apl: "0055",
    bpl: "0055",
    cpl: "0055",
    afu: "0055",
    bfu: "0055",
    cfu: "0055",
    inav: "0000",
    inbv: "0000",
    incv: "0000",
    outav: "0000",
    outbv: "0000",
    outcv: "0000",
    inuab: "0000",
    inubc: "0000",
    inuca: "0000",
    outuab: "0000",
    outubc: "0000",
    outuca: "0000",
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
    reserved1: "0000",
    reserved2: "0000",
    autostatus : "0000",
    ymdhms:'0000000000000000',
    electricaltimeswitch:'0000',
    electricaltimeswitchtime:'0000',
    phaseloss:'0055',
    outswitchstatus:'0055',
    time: "2022-12-06 09:41:56",
    ipaddress: "0.0.0.0",
    timeout: true
}
// 绑定本机的ip地址
server.bind(7400, '0.0.0.0');
// 开启socket 监听服务
server.on("message", function (msg, rinfo) {
  let startRecDataFlag = 1
  let rcmsg = msg;
  let ipinfo = rinfo;
  // console.log('port=7400已接收到设备端发送的数据：' + msg.toString('hex'));
  //console.log("port=7400设备端地址信息为：", rinfo);
  let commType = parseInt(msg.toString('hex').slice(2, 4), 16);
  //接收到消息处理
  if (startRecDataFlag) {
    switch (commType) {
      case 0x04:
        console.log('port=7400,已接收到设备端发送的应答数据：' + msg.toString('hex'));
        // msg process
        let returnmsg = {}
        //alarm
        let auv = rcmsg.toString('hex').slice(6, 10);
        // auv = '0055'
        returnmsg.auv = auv
        let buv = rcmsg.toString('hex').slice(10, 14);
        // buv = '0055'
        returnmsg.buv = buv
        let cuv = rcmsg.toString('hex').slice(14, 18);
        // cuv = '0055'
        returnmsg.cuv = cuv
        let aov = rcmsg.toString('hex').slice(18, 22);
        // aov = '00aa'
        returnmsg.aov = aov
        let bov = rcmsg.toString('hex').slice(22, 26);
        // bov = '00aa'
        returnmsg.bov = bov
        let cov = rcmsg.toString('hex').slice(26, 30);
        // cov = '00aa'
        returnmsg.cov = cov
        let aoa = rcmsg.toString('hex').slice(30, 34);
        // aoa = '00aa'
        returnmsg.aoa = aoa
        let boa = rcmsg.toString('hex').slice(34, 38);
        // boa = '00aa'
        returnmsg.boa = boa
        let coa = rcmsg.toString('hex').slice(38, 42);
        // coa = '00aa'
        returnmsg.coa = coa
        let apl = rcmsg.toString('hex').slice(42, 46);
        // apl = '00aa'
        returnmsg.apl = apl
        let bpl = rcmsg.toString('hex').slice(46, 50);
        // bpl = '00aa'
        returnmsg.bpl = bpl
        let cpl = rcmsg.toString('hex').slice(50, 54);
        // cpl = '00aa'
        returnmsg.cpl = cpl
        let afu = rcmsg.toString('hex').slice(54, 58);
        // afu = '00aa'
        returnmsg.afu = afu
        let bfu = rcmsg.toString('hex').slice(58, 62);
        // bfu = '00aa'
        returnmsg.bfu = bfu
        let cfu = rcmsg.toString('hex').slice(62, 66);
        // cfu = '00aa'
        returnmsg.cfu = cfu
        //parama
        let inav = rcmsg.toString('hex').slice(66, 70);
        // inav = '00ee'
        returnmsg.inav = inav
        let inbv = rcmsg.toString('hex').slice(70, 74);
        // inbv = '00ea'
        returnmsg.inbv = inbv
        let incv = rcmsg.toString('hex').slice(74, 78);
        // incv = '00e8'
        returnmsg.incv = incv
        let outav = rcmsg.toString('hex').slice(78, 82);
        // outav = '00e2'
        returnmsg.outav = outav
        let outbv = rcmsg.toString('hex').slice(82, 86);
        // outbv = '00e3'
        returnmsg.outbv = outbv
        let outcv = rcmsg.toString('hex').slice(86, 90);
        // outcv = '00e4'
        returnmsg.outcv = outcv
        let inuab = rcmsg.toString('hex').slice(90, 94);
        // inuab = '019a'
        returnmsg.inuab = inuab
        let inubc = rcmsg.toString('hex').slice(94, 98);
        // inubc = '0195'
        returnmsg.inubc = inubc
        let inuca = rcmsg.toString('hex').slice(98, 102);
        // inuca = '0198'
        returnmsg.inuca = inuca
        let outuab = rcmsg.toString('hex').slice(102, 106);
        // outuab = '0199'
        returnmsg.outuab = outuab
        let outubc = rcmsg.toString('hex').slice(106, 110);
        // outubc = '0194'
        returnmsg.outubc = outubc
        let outuca = rcmsg.toString('hex').slice(110, 114);
        // outuca = '019a'
        returnmsg.outuca = outuca
        //status
        let mainstatus = rcmsg.toString('hex').slice(114, 118);
        returnmsg.mainstatus = mainstatus
        let stabilestatus= rcmsg.toString('hex').slice(118, 122);
        returnmsg.stabilestatus = stabilestatus
        let stepstatus = rcmsg.toString('hex').slice(122, 126);
        returnmsg.stepstatus = stepstatus
        let syncstatus = rcmsg.toString('hex').slice(126, 130);
        returnmsg.syncstatus = syncstatus
        let reserved1 = rcmsg.toString('hex').slice(130, 134);
        returnmsg.reserved1 = reserved1
        let reserved2 = rcmsg.toString('hex').slice(134, 138);
        returnmsg.reserved2 = reserved2
        //unused
        let ymdhms = rcmsg.toString('hex').slice(138, 162);
        returnmsg.ymdhms = ymdhms
        let electricaltimeswitch = rcmsg.toString('hex').slice(162, 166);
        returnmsg.electricaltimeswitch = electricaltimeswitch
        let electricaltimeswitchtime = rcmsg.toString('hex').slice(166, 170);
        returnmsg.electricaltimeswitchtime = electricaltimeswitchtime
        //param
        let aa = rcmsg.toString('hex').slice(170, 174);
        // aa = '0011'
        returnmsg.aa = aa
        let ba = rcmsg.toString('hex').slice(174, 178);
        // ba = '0013'
        returnmsg.ba = ba
        let ca = rcmsg.toString('hex').slice(178, 182);
        // ca = '0015'
        returnmsg.ca = ca
        // alarm
        let phaseloss = rcmsg.toString('hex').slice(182, 186);
        // phaseloss = '00aa'
        returnmsg.phaseloss = phaseloss
        // status
        let outswitchstatus = rcmsg.toString('hex').slice(186, 190);
        // outswitchstatus = '0055'
        returnmsg.outswitchstatus = outswitchstatus
        // del start
        let abcv = rcmsg.toString('hex').slice(66, 70);
        returnmsg.abcv = abcv
        let av = rcmsg.toString('hex').slice(58, 62);
        returnmsg.av = av
        let bv = rcmsg.toString('hex').slice(62, 66);
        returnmsg.bv = bv
        let cv = rcmsg.toString('hex').slice(66, 70);
        returnmsg.cv = cv
        let abca = rcmsg.toString('hex').slice(70, 74);
        returnmsg.abca = abca
        let autostatus = rcmsg.toString('hex').slice(102, 106);
        returnmsg.autostatus = autostatus
        // del end
        let date = new Date()
        let year = date.getFullYear() 
        let month =  date.getMonth()+1 
        let day = date.getDate()
        let hour =  date.getHours() 
        let minute = date.getMinutes()
        let second = date.getSeconds()
        let time = year + '-' + String(month >9?month:("0"+month)) + '-' + String(day >9?day:("0"+day)) + ' ' +  String(hour >9?hour:("0"+hour)) + ':' + String(minute >9?minute:("0"+minute)) + ':' + String(second >9?second:("0"+second)) 
        returnmsg.time = time
        returnmsg.ipaddress = ipinfo.address
        returnmsg.com = '0055'
        returnmsg.timeout = false
        console.log('returnmsg', returnmsg)
        msg = JSON.stringify(returnmsg)
        // let key = 0x04;
        let key = ipinfo.address
        // key = '192.168.1.171'
        let res = {
          token: key,
          msg: msg
        }
        let req = promisePool[key]
        if (req) {
          req.resolve(res);
          clearTimeout(req.timer);
          console.log("=========port=7400,0x04收到正确应答消息========，token=", key);
          delete promisePool[key];
        } else {
          console.log("=========port=7400,0x04消息过期或不明消息========", key);
          }
      break;
      default:
    }
  }
})
server.on("listening", function () {
    let address = server.address();
    console.log("AC_AB socket服务器开始监听。地址信息为", address);
});
// power ac service
class PoweracService extends Service {
  // save data to db
  async saveAcAbParams() {
    // 读取设备列表
    let deviceList = await this.ctx.service.db.getAllAcDeviceList()
    console.log("saveAcAbParams:从数据库读取的deviceList",deviceList);
    this.ctx.service.powerac.saveAcAbData(deviceList)
    return 0
  }
  // saveAcAbData
  async saveAcAbData(list) {
    for (let i = 0; i < list.length; i++) {
      let saveData = {}
      let deviceData = JSON.parse(deviceParams[list[i].catalogid])
      console.log("saveAcAbData:要插入data数据库的原始设备数据",deviceData)
      saveData.id = list[i].catalogid + '_' + deviceData.time
      saveData.catalogid = list[i].catalogid
      saveData.devicetype = list[i].protocoltype
      saveData.code = list[i].label
      saveData.mudtype = '0003'
      saveData.addinfo = '00'
      saveData.timestamp = deviceData.time
      saveData = Object.assign(saveData,deviceData)
      console.log("saveAcAbData:要插入data数据库的数据",saveData)
      this.ctx.service.db.insertDataIntoDB(saveData)
    }
  }
  // getacparamfromagent
  async getacparamfromagent(catalogid) {
    return deviceParams[catalogid]
  }
  // agentAcProcessSetParams
  async agentAcProcessSetParams(params, catalogid) {
    // 1,restore
    let json = JSON.parse(params.result)
    this.ctx.service.powerac.agentAcProcessCheckAlarmRestore(json, catalogid)
    // 2,更新内存数据区
    deviceParams[catalogid] = params.result
    // console.log('内存设备参数区', deviceParams[catalogid])
  }
  // agentAcProcessCheckAlarmRestore
  async agentAcProcessCheckAlarmRestore(params, catalogid) {
    this.ctx.service.db.readAllCurrentAlarm()
      .then((e)=>{
        // console.log('agentAcProcessCheckAlarmRestore返回当前告警数据库：\n', e)
        let table = []
        if (e.length > 0) {
          table = e
          // console.log('agentAcProcessCheckAlarmRestore当前告警数据库：\n', table, catalogid)
          // 检查告警恢复
          this.ctx.service.powerac.agentAcProcessCheckRestote(e, catalogid, params)
        } else console.log('agentAcProcessCheckAlarmRestore 没有当前告警：', e)
      })
  }
  // agentAcProcessCheckRestote
  async agentAcProcessCheckRestote(table, catalogid, params) {
    // alarm restore check
    // console.log('agentAcProcessCheckRestote当前告警数据库：\n', table, catalogid)
    for (let i = 0; i < table.length; i++) {
      if (table[i].alarmmudid === catalogid) {
        // console.log('agentAcProcessCheckRestote发现当前告警记录已存在..\n', table[i], catalogid, params)
        this.ctx.service.powerac.alarmRestoreCheck(table[i], params)
      }
    }
  }
  // alarmRestoreCheck
  async alarmRestoreCheck (oldAlarm, nowParams) {
    let restoredTable = []
      let arrayData = new Array(17)
      // console.log('alarmRestoreCheck', oldAlarm, nowParams)
      for (let i = 0; i < 17; i++) {
        arrayData[i] = {
          alarmid: "0000",
          alarmrestoreflag: false,
          alarmrestoreinfo: ""
        }
      }
      if (oldAlarm.alarmdetail === 'com' && nowParams.com === '0055') {
        arrayData[16].alarmid = oldAlarm.alarmid
        arrayData[16].alarmrestoreflag = true
        arrayData[16].alarmrestoreinfo = nowParams.time
        restoredTable.push(arrayData[16])
      } else {
        if (oldAlarm.alarmdetail === 'auv' && nowParams.auv === '0055' && nowParams.com !== '00aa') {
          arrayData[0].alarmid = oldAlarm.alarmid
          arrayData[0].alarmrestoreflag = true
          arrayData[0].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[0])
        }
        if (oldAlarm.alarmdetail === 'buv' && nowParams.buv === '0055' && nowParams.com !== '00aa') {
          arrayData[1].alarmid = oldAlarm.alarmid
          arrayData[1].alarmrestoreflag = true
          arrayData[1].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[1])
        }
        if (oldAlarm.alarmdetail === 'cuv' && nowParams.cuv === '0055' && nowParams.com !== '00aa') {
          arrayData[2].alarmid = oldAlarm.alarmid
          arrayData[2].alarmrestoreflag = true
          arrayData[2].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[2])
        }
        if (oldAlarm.alarmdetail === 'aov' && nowParams.aov === '0055' && nowParams.com !== '00aa') {
          arrayData[3].alarmid = oldAlarm.alarmid
          arrayData[3].alarmrestoreflag = true
          arrayData[3].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[3])
        }
        if (oldAlarm.alarmdetail === 'bov' && nowParams.bov === '0055' && nowParams.com !== '00aa') {
          arrayData[4].alarmid = oldAlarm.alarmid
          arrayData[4].alarmrestoreflag = true
          arrayData[4].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[4])
        }
        if (oldAlarm.alarmdetail === 'cov' && nowParams.cov === '0055' && nowParams.com !== '00aa') {
          arrayData[5].alarmid = oldAlarm.alarmid
          arrayData[5].alarmrestoreflag = true
          arrayData[5].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[5])
        }
        if (oldAlarm.alarmdetail === 'aoa' && nowParams.aoa === '0055' && nowParams.com !== '00aa') {
          arrayData[6].alarmid = oldAlarm.alarmid
          arrayData[6].alarmrestoreflag = true
          arrayData[6].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[6])
        }
        if (oldAlarm.alarmdetail === 'boa' && nowParams.boa === '0055' && nowParams.com !== '00aa') {
          arrayData[7].alarmid = oldAlarm.alarmid
          arrayData[7].alarmrestoreflag = true
          arrayData[7].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[7])
        }
        if (oldAlarm.alarmdetail === 'coa' && nowParams.coa === '0055' && nowParams.com !== '00aa') {
          arrayData[8].alarmid = oldAlarm.alarmid
          arrayData[8].alarmrestoreflag = true
          arrayData[8].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[8])
        }
        if (oldAlarm.alarmdetail === 'apl' && nowParams.apl === '0055' && nowParams.com !== '00aa') {
          arrayData[9].alarmid = oldAlarm.alarmid
          arrayData[9].alarmrestoreflag = true
          arrayData[9].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[9])
        }
        if (oldAlarm.alarmdetail === 'bpl' && nowParams.bpl === '0055' && nowParams.com !== '00aa') {
          arrayData[10].alarmid = oldAlarm.alarmid
          arrayData[10].alarmrestoreflag = true
          arrayData[10].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[10])
        }
        if (oldAlarm.alarmdetail === 'cpl' && nowParams.cpl === '0055' && nowParams.com !== '00aa') {
          arrayData[11].alarmid = oldAlarm.alarmid
          arrayData[11].alarmrestoreflag = true
          arrayData[11].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[11])
        }
        if (oldAlarm.alarmdetail === 'afu' && nowParams.afu === '0055' && nowParams.com !== '00aa') {
          arrayData[12].alarmid = oldAlarm.alarmid
          arrayData[12].alarmrestoreflag = true
          arrayData[12].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[12])
        }
        if (oldAlarm.alarmdetail === 'bfu' && nowParams.bfu === '0055' && nowParams.com !== '00aa') {
          arrayData[13].alarmid = oldAlarm.alarmid
          arrayData[13].alarmrestoreflag = true
          arrayData[13].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[13])
        }
        if (oldAlarm.alarmdetail === 'cfu' && nowParams.cfu === '0055' && nowParams.com !== '00aa') {
          arrayData[14].alarmid = oldAlarm.alarmid
          arrayData[14].alarmrestoreflag = true
          arrayData[14].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[14])
        }
        if (oldAlarm.alarmdetail === 'phaseloss' && nowParams.phaseloss === '0055' && nowParams.com !== '00aa') {
          arrayData[15].alarmid = oldAlarm.alarmid
          arrayData[15].alarmrestoreflag = true
          arrayData[15].alarmrestoreinfo = nowParams.time
          restoredTable.push(arrayData[15])
        }
      }
      // 告警恢复处理流程
      if (restoredTable.length > 0) {
      // 处理告警恢复'设备应答超时，读取数据失败？？'
      // 1,当前告警转入历史告警
      // 2,向客户端发送告警恢复消息
      // console.log('alarmRestoreCheck发现告警恢复', restoredTable)
      this.ctx.service.powerac.agentAlarmRestoreProcess(restoredTable)
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
          console.log('\nagentAlarmRestoreProcess当前告警查询结果:')
          console.log(res)
          // 0,推送告警恢复
          let codecyclealarm = {}
          codecyclealarm.socketname = 'alarm'
          codecyclealarm.catalogid = r[i].alarmmudid
          codecyclealarm.protocoltype = '2'
          codecyclealarm.functioncode = r[i].alarmdetail
          codecyclealarm.alarmfired = false
          codecyclealarm.alarmrestore = true
          codecyclealarm.address = "0000"
          codecyclealarm.stamp = r[i].alarmrestoreinfo
          console.log('-------agentAlarmRestoreProcess,ac has sent codecyclealarm websocket message=',codecyclealarm)
          // this.ctx.app.io.emit("alarm", JSON.stringify(codecyclealarm))
          this.ctx.app.io.emit("alarm", {code: codecyclealarm})
          // 1,当前的告警，转移到历史告警数据库
          let writeData = res[0]
          writeData.alarmrestoreflag = true
          writeData.alarmrestoreinfo = r[i].alarmrestoreinfo
          this.ctx.service.db.insertToHistoryAlarmOne(writeData)
            .then((res) => {
              console.log('\nagentAlarmRestoreProcess当前告警转移到历史告警结果:')
              console.log(res)
              // 2,在当前告警数据库中删除这条告警
              let alarmid = {
              alarmid: writeData.alarmid
              }
              this.ctx.service.db.delCurrentAlarmOne(r[i].alarmid)
                .then((res) => {
                  console.log('\nagentAlarmRestoreProcess删除当前告警结果:')
                  console.log(res)
              })
          })
        })
      }
    }
  }
  // agentAcProcessCheckAlarm
  async agentAcProcessCheckAlarm(params, catalogid, label) {
    let a = {}
    let alarmFired = false
    a = JSON.parse(params.result)
    // console.log('告警监测输入的参数______________________________________________\n', a)
    
    alarmFired = (a.auv=== '00aa') | (a.buv=== '00aa') | (a.cuv=== '00aa') | (a.aov=== '00aa') | (a.bov=== '00aa')| (a.cov=== '00aa') | (a.aoa=== '00aa') | (a.boa=== '00aa')| (a.coa=== '00aa') | (a.afu=== '00aa') | (a.bfu=== '00aa') | (a.cfu=== '00aa') | (a.com=== '00aa') | (a.apl=== '00aa') | (a.bpl=== '00aa') | (a.cpl=== '00aa') | (a.phaseloss=== '00aa')
    let alarmTable0 = []
    let arrayData = new Array(17)
    for (let i = 0; i < 17; i++) {
      arrayData[i] = {
        alarmid: "0000",
        alarmstation: label,
        alarmmudid: catalogid,
        alarmreceivedtime: a.time,
        alarmfiredtime: a.time,
        alarmdetail: "0000",
        alarmreason: "0000",
        alarmlevel: "0000",
        alarmconfirmedflag: false,
        alarmconfirmedtime: "",
        alarmconfirmedinfo: "",
        alarmrestoreflag: false,
        alarmrestoreinfo: "",
        alarmsourceip: "0000",
        alarmaddition: "0000"
      }
    }
    if (alarmFired) {
      if (a.com === '00aa') {
        arrayData[16].alarmdetail = 'com'
        arrayData[16].alarmid = catalogid + '_' + a.time + '_' + arrayData[16].alarmdetail
        arrayData[16].alarmStatus = true
        arrayData[16].time = a.time
        // console.log('com', arrayData[12])
        alarmTable0.push(arrayData[16])
        // console.log('com后', alarmTable0)
      }
        else {
          if (a.auv === '00aa') {
            arrayData[0].alarmdetail = 'auv'
            arrayData[0].alarmid = catalogid + '_' + a.time + '_' + arrayData[0].alarmdetail
            arrayData[0].alarmStatus = true
            arrayData[0].time = a.time
            // console.log('auv', arrayData[0])
            alarmTable0.push(arrayData[0])
            // console.log('auv后', alarmTable0)
          }
          if (a.buv === '00aa') {
            arrayData[1].alarmdetail = 'buv'
            arrayData[1].alarmid = catalogid + '_' + a.time + '_' + arrayData[1].alarmdetail
            arrayData[1].alarmStatus = true
            arrayData[1].time = a.time
            // console.log('buv', arrayData[1])
            alarmTable0.push(arrayData[1])
            // console.log('buv后', alarmTable0)
          }
          if (a.cuv === '00aa') {
            arrayData[2].alarmdetail = 'cuv'
            arrayData[2].alarmid = catalogid + '_' + a.time + '_' + arrayData[2].alarmdetail
            arrayData[2].alarmStatus = true
            arrayData[2].time = a.time
            // console.log('cuv', arrayData[2])
            alarmTable0.push(arrayData[2])
            // console.log('cuv后', alarmTable0)
          }
          if (a.aov === '00aa') {
            arrayData[3].alarmdetail = 'aov'
            arrayData[3].alarmid = catalogid + '_' + a.time + '_' + arrayData[3].alarmdetail
            arrayData[3].alarmStatus = true
            arrayData[3].time = a.time
            console.log('aov', arrayData[3])
            alarmTable0.push(arrayData[3])
            // console.log('aov后', alarmTable0)
          }
          if (a.bov === '00aa') {
            arrayData[4].alarmdetail = 'bov'
            arrayData[4].alarmid = catalogid + '_' + a.time + '_' + arrayData[4].alarmdetail
            arrayData[4].alarmStatus = true
            arrayData[4].time = a.time
            console.log('buv', arrayData[4])
            alarmTable0.push(arrayData[4])
            // console.log('buv后', alarmTable0)
          }
          if (a.cov === '00aa') {
            arrayData[5].alarmdetail = 'cov'
            arrayData[5].alarmid = catalogid + '_' + a.time + '_' + arrayData[5].alarmdetail
            arrayData[5].alarmStatus = true
            arrayData[5].time = a.time
            console.log('cov', arrayData[5])
            alarmTable0.push(arrayData[5])
            // console.log('cov后', alarmTable0)
          }
          if (a.aoa === '00aa') {
            arrayData[6].alarmdetail = 'aoa'
            arrayData[6].alarmid = catalogid + '_' + a.time + '_' + arrayData[6].alarmdetail
            arrayData[6].alarmStatus = true
            arrayData[6].time = a.time
            console.log('aoa', arrayData[6])
            alarmTable0.push(arrayData[6])
            // console.log('aoa后', alarmTable0)
          }
          if (a.boa === '00aa') {
            arrayData[7].alarmdetail = 'boa'
            arrayData[7].alarmid = catalogid + '_' + a.time + '_' + arrayData[7].alarmdetail
            arrayData[7].alarmStatus = true
            arrayData[7].time = a.time
            console.log('boa', arrayData[7])
            alarmTable0.push(arrayData[7])
            // console.log('boa后', alarmTable0)
          }
          if (a.coa === '00aa') {
            arrayData[8].alarmdetail = 'coa'
            arrayData[8].alarmid = catalogid + '_' + a.time + '_' + arrayData[8].alarmdetail
            arrayData[8].alarmStatus = true
            arrayData[8].time = a.time
            console.log('coa', arrayData[8])
            alarmTable0.push(arrayData[8])
            // console.log('coa后', alarmTable0)
          }
          if (a.apl === '00aa') {
            arrayData[9].alarmdetail = 'apl'
            arrayData[9].alarmid = catalogid + '_' + a.time + '_' + arrayData[9].alarmdetail
            arrayData[9].alarmStatus = true
            arrayData[9].time = a.time
            console.log('apl', arrayData[9])
            alarmTable0.push(arrayData[9])
            // console.log('afu后', alarmTable0)
          }
          if (a.bpl === '00aa') {
            arrayData[10].alarmdetail = 'bpl'
            arrayData[10].alarmid = catalogid + '_' + a.time + '_' + arrayData[10].alarmdetail
            arrayData[10].alarmStatus = true
            arrayData[10].time = a.time
            console.log('bpl', arrayData[10])
            alarmTable0.push(arrayData[10])
            // console.log('bfu后', alarmTable0)
          }
          if (a.cpl === '00aa') {
            arrayData[11].alarmdetail = 'cpl'
            arrayData[11].alarmid = catalogid + '_' + a.time + '_' + arrayData[11].alarmdetail
            arrayData[11].alarmStatus = true
            arrayData[11].time = a.time
            console.log('cpl', arrayData[11])
            alarmTable0.push(arrayData[11])
            console.log('cpl后', alarmTable0)
          }
          if (a.afu === '00aa') {
            arrayData[12].alarmdetail = 'afu'
            arrayData[12].alarmid = catalogid + '_' + a.time + '_' + arrayData[12].alarmdetail
            arrayData[12].alarmStatus = true
            arrayData[12].time = a.time
            console.log('afu', arrayData[12])
            alarmTable0.push(arrayData[12])
            // console.log('afu后', alarmTable0)
          }
          if (a.bfu === '00aa') {
            arrayData[13].alarmdetail = 'bfu'
            arrayData[13].alarmid = catalogid + '_' + a.time + '_' + arrayData[13].alarmdetail
            arrayData[13].alarmStatus = true
            arrayData[13].time = a.time
            console.log('bfu', arrayData[13])
            alarmTable0.push(arrayData[13])
            // console.log('bfu后', alarmTable0)
          }
          if (a.cfu === '00aa') {
            arrayData[14].alarmdetail = 'cfu'
            arrayData[14].alarmid = catalogid + '_' + a.time + '_' + arrayData[14].alarmdetail
            arrayData[14].alarmStatus = true
            arrayData[14].time = a.time
            console.log('cfu', arrayData[14])
            alarmTable0.push(arrayData[14])
            console.log('cfu后', alarmTable0)
          }
          if (a.phaseloss === '00aa') {
            arrayData[15].alarmdetail = 'phaseloss'
            arrayData[15].alarmid = catalogid + '_' + a.time + '_' + arrayData[15].alarmdetail
            arrayData[15].alarmStatus = true
            arrayData[15].time = a.time
            console.log('phaseloss', arrayData[15])
            alarmTable0.push(arrayData[15])
            console.log('phaseloss', alarmTable0)
          }
        }
      // console.log('查询到了告警！！！！！！！！！！\n', alarmTable0)
      this.ctx.service.powerac.alarmTryInsertToDB(alarmTable0)
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
            console.log('写入当前告警数据库：\n', alarmTable[i])
            // console.log('写入当前告警数据库：\n', alarmTable[i])
            this.ctx.service.db.insertCurrentAlarmDb(alarmTable[i])
              .then((e)=>{
                // 2,websocket告警上传客户端
                // let websocketCycleAlarm = websocketsend
                let codecyclealarm = {}
                codecyclealarm.socketname = 'alarm'
                codecyclealarm.catalogid = alarmTable[i].alarmmudid
                codecyclealarm.protocoltype = '2'
                codecyclealarm.functioncode = alarmTable[i].alarmdetail
                codecyclealarm.alarmfired = true
                codecyclealarm.alarmrestore = false
                codecyclealarm.address = "0000"
                codecyclealarm.stamp = alarmTable[i].alarmfiredtime
                // websocketCycleAlarm.send(codeoffline)
                console.log('-------alarmTryInsertToDB,ac has sent codecyclealarm websocket message=',codecyclealarm)
                // this.ctx.app.io.emit("alarm", JSON.stringify(codecyclealarm))
                this.ctx.app.io.emit("alarm", {code: codecyclealarm})
              })
          }
        })
    }
  }
  // agentAcProcessCommAlarm
  // agentAcProcess
  async agentAcProcess(l) {
    // console.log('enter agentAcProcess', l)
    // 读取设备数据
    let list = l
    let token = 0x04
    let msg = [1,4,0,1,0,0x2e,0x21,0xd6]
    for (let i = 0; i < list.length; i++) {
      let powerip = list[i].ipaddress
      this.ctx.service.powerac.sendMsgPromiseTimeout(token, msg, powerip)
          .then((e)=>{
            //console.log("agentAcProcess:promise resolve 处理结束-----------------",e);
            //console.log("agentAcProcess:promise resolve 错误次数-----------------",errorTimes);
            let receiveMsg = e.msg
            let code = 1
            // 删掉timeout 如果存在
            for (let ii = 0; ii < timeoutArr.length; ii++) {
              if (timeoutArr[ii].catalogid === list[i].catalogid) {
                timeoutArr[ii].times = 0
                // 删除
                console.log("agentAcProcess:删除已恢复通信的超时记录-----------------\n",timeoutArr[ii]);
                timeoutArr.splice(ii, 1)
              }
            }
            let data = {result:receiveMsg, code:code, catalogid: list[i].catalogid}
            let returnParam = data
            // agent task
            this.ctx.service.powerac.agentAcProcessSetParams(returnParam, list[i].catalogid)
            this.ctx.service.powerac.agentAcProcessCheckAlarm(returnParam, list[i].catalogid, list[i].label)
            // console.log(returnParam)
          })
          .catch((e)=>{
            console.log("agentAcProcess:promise reject 处理超时？？？？？？？？？",e, timeoutArr);
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
            this.ctx.service.powerac.agentAcProcessSetParams(returnParam, list[i].catalogid)
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
                this.ctx.service.powerac.agentAcProcessCheckAlarm(returnParam, list[i].catalogid, list[i].label)
                console.log("agentAcProcess:已产生通信告警\n", timeout);
              }
            }
            if (!exist) timeoutArr.push(timeout)
        })
    }
  }
  // get session ID
  async getSessionID() {
    if (session > 65535)
      session = 0;
      session = session + 1
      return session
  }
  // 读取设备数据，并发现告警和告警恢复
  async getAcAbParams() {
    // 读取设备列表
    let deviceList = await this.ctx.service.db.getAllAcDeviceList()
    // console.log("getAcAbParams:从数据库读取的deviceList",deviceList);
    this.ctx.service.powerac.agentAcProcess(deviceList)
    return 0
  }
  // end 读取设备数据
  // 读取告警信息并存入alarmTable
  async getAcAbAlarm(token, msg, powerip) {
    let returnParam
    await sendMsgPromiseTimeout(token, msg, powerip)
            .then((e)=>{
                console.log("getAcAbParam:promise resolve 处理结束-----------------",e)
                let receiveMsg = e.msg
                let code = 1   
                data = {result:receiveMsg,code:code}
                returnParam = data 
                return returnParam
            })
            .catch((e)=>{
                console.log("getAcAbParam:promise reject 处理超时？？？？？？？？？",e)
                let receiveMsg = '设备应答超时，读取数据失败？？'
                let code = -1
                data = {result:receiveMsg,code:code}
                returnParam = data 
                return returnParam
            })
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
        // send msg to device
        let buf = new Buffer.from(msg)
        let returncode = 0
        server.send(buf, 0, buf.length, 7400, powerip, function (err, bytes) {
            returncode = err
            if (err) {
                console.log('send data err');
            } else {
                console.log("send data length=:", bytes);
            }
        });
        console.log("sendMsgPromiseTimeout给socket发送的请求命令数据为：" + buf.toString('hex'))
        // return promise
        let token = powerip
        console.log("send data current token=:", token);
        let timer = null
        let err = {
            token: token
        }
        return Promise.race([
            new Promise((resolve, reject) => {
                //console.log('本次token=', token)
                timer = setTimeout(() => {
                    console.log('本次消息请求，超时未收到应答,token =', token)
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
module.exports = PoweracService;

