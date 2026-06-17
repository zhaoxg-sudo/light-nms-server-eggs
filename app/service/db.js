const Service = require('egg').Service;
const { Pool, Client} = require('pg')

class DbService extends Service {
  // alarm fired
  async alarmFiredCheck(request) {
    //connect db
    // console.log('alarmFiredCheck:=\n', request)
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
    let alarmdetail = request.alarmdetail
    let alarmmudid = request.alarmmudid
    // console.log('request=\n', request)
    // console.log('alarmFiredCheck@@@@@@@@@@ alarmdetail=\n', alarmdetail)
    // console.log('alarmFiredCheck@@@@@@@@@@ alarmmudid=\n', alarmmudid)
    let  data = await client.query('SELECT * from power_alarm_current where alarmdetail =' + "'" +  alarmdetail + "'" + " and alarmmudid = " + "'" + alarmmudid + "'")
    client.end()
    //end db
    // console.log('alarmFiredCheck   db return=\n', data.rows)
    return data.rows
  }
  // current alarm del
  async delCurrentAlarmOne(alarmid) {
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
    let data = await client.query('DELETE from power_alarm_current where alarmid =' + "'" + alarmid + "'")
    client.end()
    //end db
    console.log('currentAlarmDelOne=', data)
    return data.rows
  }
  // get current alarm one
  async getCurrentAlarmOne(alarmid) {
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
      console.log("current alarm  alarmid=", alarmid)
      let  data = await client.query('SELECT * from power_alarm_current where alarmid =' + "'" +  alarmid + "'")
      client.end()
    //end db
    console.log('getCurrentAlarmOne=', data.rows)
    return data.rows
  }
  //获取所有报警设备数据库
  async readAllCurrentAlarm() {
    //connect db
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'power',
      password: 'shyh2017',
      port: 5432,
    })
    client.connect() 
    let sql = "SELECT * from power_alarm_current"
    let db = await client.query(sql);
      
    client.end() 
    return db.rows;
  }
  //新增data记录
  async insertDataIntoDB(saveData) {
  
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
    })
    client.connect() 
    
    let insertSql = "insert into power_data_manage (id,catalogid,code,devicetype,mudtype,com,auv,buv,cuv,aov,bov,cov,aoa,boa,coa,apl,bpl,cpl,afu,bfu,cfu,inav,inbv,incv,outav,outbv,outcv,inubc,inuca,inuab,outuab,outubc,outuca,abcv,av,bv,cv,abca,aa,ba,ca,mainstatus,stabilestatus,stepstatus,syncstatus,autostatus,reserved1,reserved2,ymdhms,electricaltimeswitch,electricaltimeswitchtime,phaseloss,outswitchstatus,ipaddress,timestamp,addinfo) \
      values ("+ "'"+saveData.id+"'"+",\
              "+ "'"+saveData.catalogid+"'"+",\
              "+ "'"+saveData.code+"'"+",\
              "+ "'"+saveData.devicetype+"'"+",\
              "+ "'"+saveData.mudtype+"'"+",\
              "+ "'"+saveData.com+"'"+",\
              "+ "'"+saveData.auv+"'"+",\
              "+ "'"+saveData.buv+"'"+",\
              "+ "'"+saveData.cuv+"'"+",\
              "+ "'"+saveData.aov+"'"+",\
              "+ "'"+saveData.bov+"'"+",\
              "+ "'"+saveData.cov+"'"+",\
              "+ "'"+saveData.aoa+"'"+",\
              "+ "'"+saveData.boa+"'"+",\
              "+ "'"+saveData.coa+"'"+",\
              "+ "'"+saveData.apl+"'"+",\
              "+ "'"+saveData.bpl+"'"+",\
              "+ "'"+saveData.cpl+"'"+",\
              "+ "'"+saveData.afu+"'"+",\
              "+ "'"+saveData.bfu+"'"+",\
              "+ "'"+saveData.cfu+"'"+",\
              "+ "'"+saveData.inav+"'"+",\
              "+ "'"+saveData.inbv+"'"+",\
              "+ "'"+saveData.incv+"'"+",\
              "+ "'"+saveData.outav+"'"+",\
              "+ "'"+saveData.outbv+"'"+",\
              "+ "'"+saveData.outcv+"'"+",\
              "+ "'"+saveData.inuab+"'"+",\
              "+ "'"+saveData.inubc+"'"+",\
              "+ "'"+saveData.inuca+"'"+",\
              "+ "'"+saveData.outuab+"'"+",\
              "+ "'"+saveData.outubc+"'"+",\
              "+ "'"+saveData.outuca+"'"+",\
              "+ "'"+saveData.abcv+"'"+",\
              "+ "'"+saveData.av+"'"+",\
              "+ "'"+saveData.bv+"'"+",\
              "+ "'"+saveData.cv+"'"+",\
              "+ "'"+saveData.abca+"'"+",\
              "+ "'"+saveData.aa+"'"+",\
              "+ "'"+saveData.ba+"'"+",\
              "+ "'"+saveData.ca+"'"+",\
              "+ "'"+saveData.mainstatus+"'"+",\
              "+ "'"+saveData.stabilestatus+"'"+",\
              "+ "'"+saveData.stepstatus+"'"+",\
              "+ "'"+saveData.syncstatus+"'"+",\
              "+ "'"+saveData.autostatus+"'"+",\
              "+ "'"+saveData.reserved1+"'"+",\
              "+ "'"+saveData.reserved2+"'"+",\
              "+ "'"+saveData.ymdhms+"'"+",\
              "+ "'"+saveData.electricaltimeswitch+"'"+",\
              "+ "'"+saveData.electricaltimeswitchtime+"'"+",\
              "+ "'"+saveData.phaseloss+"'"+",\
              "+ "'"+saveData.outswitchstatus+"'"+",\
              "+ "'"+saveData.ipaddress+"'"+",\
              "+ "'"+saveData.timestamp+"'"+",\
              "+ "'"+saveData.addinfo+"'"+")";
    console.log(insertSql);
    let insertErr = await client.query(insertSql);
    if (insertErr)
      console.log("insertDataIntoDB---db服务，新增data数据库记录：",saveData); 
      else console.log("insertDataIntoDB---db服务，新增data数据库记录失败？？？？？？？：",saveData); 
    
    client.end();
    return insertErr;
  }
  //新增data记录
  async insertClsdDataIntoDB(saveData) {
  
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
    })
    client.connect() 
    
    let insertSql = "insert into power_clsd_manage (id,catalogid,code,devicetype,mudtype,com,offline,shutdown,alarm,inv,outv,outw,temp,outswitch,runstatus,runtime,ipaddress,timestamp,addinfo) \
      values ("+ "'"+saveData.id+"'"+",\
              "+ "'"+saveData.catalogid+"'"+",\
              "+ "'"+saveData.code+"'"+",\
              "+ "'"+saveData.devicetype+"'"+",\
              "+ "'"+saveData.mudtype+"'"+",\
              "+ "'"+saveData.com+"'"+",\
              "+ "'"+saveData.offline+"'"+",\
              "+ "'"+saveData.shutdown+"'"+",\
              "+ "'"+saveData.alarm+"'"+",\
              "+ "'"+saveData.inv+"'"+",\
              "+ "'"+saveData.outv+"'"+",\
              "+ "'"+saveData.outw+"'"+",\
              "+ "'"+saveData.temperature+"'"+",\
              "+ "'"+saveData.outswitch+"'"+",\
              "+ "'"+saveData.runstatus+"'"+",\
              "+ "'"+saveData.runtime+"'"+",\
              "+ "'"+saveData.ipaddress+"'"+",\
              "+ "'"+saveData.timestamp+"'"+",\
              "+ "'"+saveData.addinfo+"'"+")";
    console.log(insertSql);
    let insertErr = await client.query(insertSql);
    if (insertErr)
      console.log("insertClsdDataIntoDB---db服务，新增data数据库记录：",saveData); 
      else console.log("insertClsdDataIntoDB---db服务，新增data数据库记录失败？？？？？？？：",saveData); 
    
    client.end();
    return insertErr;
  }
  //新增alarm记录
  async insertCurrentAlarmDb(saveData) {
  
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
    })
    client.connect() 
    
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
    console.log(insertSql);
    let insertErr = await client.query(insertSql);
    if (insertErr)
      console.log("insertCurrentAlarmDb---db服务，新增alarm数据库记录：",saveData); 
      else console.log("insertCurrentAlarmDb---db服务，新增alarm数据库记录失败？？？？？？？：",saveData); 
    
    client.end();
    return insertErr;
  }
  // insert to 历史告警
  async insertToHistoryAlarmOne(saveData) {
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
    console.log("---insertToHistoryAlarmOne，新增history alarm数据库记录：",saveData); 
    let insertSql = "insert into power_alarm_history (alarmid,alarmstation,alarmmudid,alarmreceivedtime,alarmfiredtime,alarmdetail,alarmreason,alarmlevel,alarmconfirmedflag,alarmconfirmedtime,alarmconfirmedinfo,alarmrestoreflag,alarmrestoreinfo,alarmsourceip,alarmaddition) \
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
    console.log(insertSql);
    let insertErr = await client.query(insertSql);
    if (insertErr)
      console.log("---insertToHistoryAlarmOne，新增history alarm数据库记录：",saveData); 
      else console.log("---insertToHistoryAlarmOne，新增alarm历史数据库记录失败？？？？？？？：",saveData); 
    client.end()
    //end db
    return insertErr
  }
  // getAllAcDeviceList
  async getAllAcDeviceList() {
      //link db
      const client = new Client({
        user: 'postgres',
          host: '127.0.0.1',
          database: 'power',
          password: 'shyh2017',
          port: 5432,
      })    
     client.connect();
     let protocoltype = 2
     let listSql = 'SELECT * from power_station_tree where protocoltype =' + "'" + protocoltype + "'";
     //console.log(clearSql);
     let db =  await client.query(listSql);
      
     // console.log("---db服务，获取AC设备列表：",db.rows);
     client.end();   
     return db.rows;
  }
  // getAllDeviceListByType
  async getAllDeviceListByType(type) {
    //link db
    const client = new Client({
      user: 'postgres',
        host: '127.0.0.1',
        database: 'power',
        password: 'shyh2017',
        port: 5432,
    })    
   client.connect();
   let protocoltype = type
   let listSql = 'SELECT * from power_station_tree where protocoltype =' + "'" + protocoltype + "'";
   //console.log(clearSql);
   let db =  await client.query(listSql);
    
   // console.log("---db服务，获取AC设备列表：",db.rows);
   client.end();   
   return db.rows;
}
}
module.exports = DbService;
