const Subscription = require('egg').Subscription;
let alarmNum = 0
class AlarmDiscovery extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '200s', // 10s间隔
      type: 'all', // 指定所有的 worker 都需要执行 
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    alarmNum = alarmNum +1
    if (alarmNum >100 )  {
      alarmNum = 0
      console.log("alarm自动更新定时器，时间到。通过websocket 发送alarm msg");
    }
    //  //1,从服务获取表
    // let table = []
    // let date = new Date()
    // let year = date.getFullYear() 
    // let month =  date.getMonth()+1 
    // let day = date.getDate()
    // let hour =  date.getHours() 
    // let minute = date.getMinutes()
    // let second = date.getSeconds()
    // let time = year + '-' + String(month >9?month:("0"+month)) + '-' + String(day >9?day:("0"+day)) + ' ' +  String(hour >9?hour:("0"+hour)) + ':' + String(minute >9?minute:("0"+minute)) + ':' + String(second >9?second:("0"+second)) 
    // // console.log('当前时间获取：====', time)
    // table = await  this.ctx.service.power.getAlarmTable();
    // // console.log('定时读取的alarm原始表', table)
    // // let leng = table.lenght 
    // if (table) {
    //   let ii;
    //   let length = table.length;
    //   let insertTable =[]
    //   // 转化为数据库的表格式，存数据库，并主动上报给客户端
    //   for ( ii=0;ii < length;ii++) {
    //     console.log("---读取alarm状态1：",table[ii].msg); 
    //     let alarmData = {}
    //     let msg = table[ii].msg
    //     console.log("---读取alarm状态2：", msg); 
    //     alarmData.alarmid = msg.token
    //     alarmData.alarmstation = {}
    //     alarmData.alarmmudid = msg.submoduleid
    //     alarmData.alarmreceivedtime = msg.receivedtime
    //     alarmData.alarmfiredtime = msg.timestamp
    //     let byte1 = msg.alarmbyte1
    //     let byte2 = msg.alarmbyte2
    //     let detail = {}
    //     detail.otp = byte1.otp
    //     detail.oap = byte1.oap
    //     detail.poweronoff = byte2.poweronoff
    //     detail.powerfault = byte2.powerfault
    //     detail.ocav = byte2.ocav
    //     detail.fanfault = byte2.fanfault
    //     detail.iov = byte2.iov
    //     detail.iuv = byte2.iuv
    //     detail.oov = byte2.oov
    //     detail.ouv = byte2.ouv
    //     alarmData.alarmdetail = detail
    //     alarmData.alarmreason = {}
    //     alarmData.alarmlevel = 0
    //     alarmData.alarmconfirmedflag = false
    //     alarmData.alarmconfirmedtime = {}
    //     alarmData.alarmconfirrmedinfo = {}
    //     alarmData.alarmrestoreflag = false
    //     alarmData.alarmrestoreinfo = {}
    //     alarmData.alarmsourceip = msg.ipinfo
    //     alarmData.alarmaddition = {}
    //     insertTable.push(alarmData)
    //     console.log("告警数据对象打印：========", alarmData)
    //     this.ctx.app.io.emit("alarm", JSON.stringify(alarmData))
    //   }
       // 写入当前告警数据库
    //   // this.ctx.service.db.insertCurrentAlarmDb(insertTable);
    // } else { console.log("定时读取的alarm表不为空，但是处理出错？？？？？？？？？？？")}
  }
}

module.exports = AlarmDiscovery;
