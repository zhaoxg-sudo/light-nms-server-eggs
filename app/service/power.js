const Service = require('egg').Service;
const { Pool, Client } = require('pg')
const dgram = require('dgram')
const server = dgram.createSocket('udp4');
const promisePool = [];
let session = 0;
let _this = this;
let alarmFiredFlag = false;
let alarmTable = [];
let sTable = [];
let port = 7300
// 绑定本机的ip地址
server.bind(7200, '0.0.0.0');
// 开启socket 监听服务
server.on("message", function (msg, rinfo) {
    let startRecDataFlag = 1
    let rcmsg = msg;
    let ipinfo = rinfo;
    console.log('已接收到设备端发送的数据：' + msg.toString('hex'));
    console.log("设备端地址信息为：", rinfo);
    let commType = parseInt(msg.toString('hex').slice(2, 4), 16);
    //需要，立即应答的
    let needAnswered = commType;
    if (needAnswered == 0x08) {
        let buf = new Buffer.from(rcmsg);
        server.send(buf, 0, buf.length, rinfo.port, rinfo.address);
        console.log("给设备端的应答数据为：" + buf.toString('hex'));

    } else if (needAnswered == 0x07){
        let msgRes = []
        let alarmbyte = 0
        let i7 = 0
        let positionStart = 0
        for (i7 = 0; i7 < 17; i7++) {
            
            alarmbyte = parseInt(rcmsg.toString('hex').slice(positionStart, positionStart + 2), 16);
            msgRes.push(alarmbyte)
            positionStart = positionStart + 2
        }
        msgRes[2] = msgRes[2] + 1
        msgRes[16] = 0
        msgRes[17] = 0
        let checksum = 0
        for (i7 = 3; i7 < 17; i7++) {
            checksum = checksum + msgRes[i7];
            //console.log(checksum);
        }
        
        checksum = checksum % 128; //取128的模
        checksum &=  0xff;//去掉可能有的高位
        // console.log('插入token 后的checksum=', checksum);
        msgRes[17] = checksum;
        let buf07 = new Buffer.from(msgRes);
        server.send(buf07, 0, buf07.length, rinfo.port, rinfo.address);
        console.log("给设备端报警上报发送确认的应答数据为：" + buf07.toString('hex'));
    }

    //接收到消息处理


    if (startRecDataFlag) {
        switch (commType) {
            case 0x07://报警处理
            let returnmsg07 = {}
            let date = new Date()
            let year = date.getFullYear() 
            let month =  date.getMonth()+1 
            let day = date.getDate()
            let hour =  date.getHours() 
            let minute = date.getMinutes()
            let second = date.getSeconds()
            let time = year + '-' + String(month >9?month:("0"+month)) + '-' + String(day >9?day:("0"+day)) + ' ' +  String(hour >9?hour:("0"+hour)) + ':' + String(minute >9?minute:("0"+minute)) + ':' + String(second >9?second:("0"+second)) 
            returnmsg07.receivedtime = time
            console.log("0x07电源告警信息上报-应答处理，消息应答为：", rcmsg);
            // 填入报警源IP和port
            returnmsg07.ipinfo = ipinfo
            //取出消息类型
            let type07 = rcmsg.toString('hex').slice(2, 4);
            returnmsg07.type = type07;
            //取出协议长度
            let length07 = rcmsg.toString('hex').slice(4, 6);
            returnmsg07.length = length07;
            //取出子模块数量
            let submoduleid07 = rcmsg.toString('hex').slice(6, 8);
            returnmsg07.submoduleid = submoduleid07;
            //取出告警1
            let alarmbyte071 = rcmsg.toString('hex').slice(8, 10);
            let alarm1bit07 = {}
            let b071 = []
            b071[0] = (alarmbyte071 & 0x01) == 0x01 ? 1 : 0;
            b071[1] = (alarmbyte071 & 0x02) == 0x02 ? 1 : 0;
            alarm1bit07.otp = b071[1]
            alarm1bit07.oap = b071[0]
            returnmsg07.alarmbyte1 = alarm1bit07;
            //取出告警2
            let alarm2bit07 = {}
            let b072 = []
            let alarmbyte072 = rcmsg.toString('hex').slice(10, 12);
            
            b072[0] = (alarmbyte072 & 0x01) == 0x01 ? 1 : 0;
            b072[1] = (alarmbyte072 & 0x02) == 0x02 ? 1 : 0;
            b072[2] = (alarmbyte072 & 0x04) == 0x04 ? 1 : 0;
            b072[3] = (alarmbyte072 & 0x08) == 0x08 ? 1 : 0;
            b072[4] = (alarmbyte072 & 0x10) == 0x10 ? 1 : 0;
            b072[5] = (alarmbyte072 & 0x20) == 0x20 ? 1 : 0;
            b072[6] = (alarmbyte072 & 0x40) == 0x40 ? 1 : 0;
            b072[7] = (alarmbyte072 & 0x80) == 0x80 ? 1 : 0;
            alarm2bit07.poweronoff = b072[0]
            alarm2bit07.powerfault = b072[1]
            alarm2bit07.ocav = b072[2]
            alarm2bit07.fanfault = b072[3]
            alarm2bit07.iov = b072[4]
            alarm2bit07.iuv = b072[5]
            alarm2bit07.oov = b072[6]
            alarm2bit07.ouv = b072[7]
            returnmsg07.alarmbyte2 = alarm2bit07;
            // 取出时间戳
            let position07 = 10
            let s075 = rcmsg.toString('hex').slice(position07 + 2, position07 + 4);
            let s074 = rcmsg.toString('hex').slice(position07 + 4, position07 + 6);
            let s073 = rcmsg.toString('hex').slice(position07 + 6, position07 + 8);
            let s072 = rcmsg.toString('hex').slice(position07 + 8, position07 + 10);
            let s071 = rcmsg.toString('hex').slice(position07 + 10, position07 + 12);
            let s070 = rcmsg.toString('hex').slice(position07 + 12, position07 + 14);
            let timestamp07 = {}
            timestamp07.year = parseInt(s075, 16);
            timestamp07.month = parseInt(s074, 16);
            timestamp07.day = parseInt(s073, 16);
            timestamp07.hour = parseInt(s072, 16);
            timestamp07.minute = parseInt(s071, 16);
            timestamp07.second  = parseInt(s070, 16);

            returnmsg07.timestamp = timestamp07;
            //取出消息序列号
            
            let s73 = rcmsg.toString('hex').slice(position07 + 14, position07 + 16);
            let s72 = rcmsg.toString('hex').slice(position07 + 16, position07 + 18);
            let s71 = rcmsg.toString('hex').slice(position07 + 18, position07 + 20);
            let s70 = rcmsg.toString('hex').slice(position07 + 20, position07 + 22);
            let token07 = parseInt(s73 + s72 + s71 + s70, 16);
            returnmsg07.token = token07;
            console.log("收到设备端的告警上报hex为：" + rcmsg.toString('hex'));
            console.log("收到设备端的告警上报hex解析为：");
            console.log(returnmsg07);

            // msg = JSON.stringify(returnmsg07)
            let res07 = {
                token: token07,
                msg: returnmsg07
            }
            console.log("0x07告警上报消息的序列号======：", token07);
            sTable.push(res07)
                // insert into alarm table or alarm DB
                // connect db
                /* const client = new Client({
                    user: 'postgres',
                    host: '127.0.0.1',
                    database: 'power',
                    password: 'shyh2017',
                    port: 5432,
                })
                client.connect()
                // insert into alarm DB
                client.query('SELECT * from power_device_local').then( (data) => {
                comsole.log(data)
                })
             
                client.end()*/

                // end db 
                // reset alarm flag

                break;
            case 0x03://读取电源状态-应答处理
                console.log("0x03读取电源状态-应答处理，消息应答为：", rcmsg);
                let returnmsg = {}
                //取出消息类型
                let type = rcmsg.toString('hex').slice(2, 4);
                returnmsg.type = type;
                //取出协议长度
                let length = rcmsg.toString('hex').slice(4, 6);
                returnmsg.length = length;
                //取出整机/子模块ID
                let id = rcmsg.toString('hex').slice(6, 8);
                returnmsg.id = id;
                //取出实时功率
                let realtimew1 = rcmsg.toString('hex').slice(8, 10);
                let realtimew0 = rcmsg.toString('hex').slice(10, 12);
                let realtimew = parseInt(realtimew1 + realtimew0, 16)
                returnmsg.realtimew = realtimew;
                //取出额定功率
                let ratedw1 = rcmsg.toString('hex').slice(12, 14);
                let ratedw0 = rcmsg.toString('hex').slice(14, 16);
                let ratedw = parseInt(ratedw1 + ratedw0, 16)
                returnmsg.ratedw = ratedw;
                //取出输出电压
                let outv1 = rcmsg.toString('hex').slice(16, 18);
                let outv0 = rcmsg.toString('hex').slice(18, 20);
                let outv = parseInt(outv1 + outv0, 16)
                returnmsg.outv = outv;
                //取出输出电流
                let outa1 = rcmsg.toString('hex').slice(20, 22);
                let outa0 = rcmsg.toString('hex').slice(22, 24);
                let outa = parseInt(outa1 + outa0, 16)
                returnmsg.outa = outa;
                //取出输入电压_A相
                let inav1 = rcmsg.toString('hex').slice(24, 26);
                let inav0 = rcmsg.toString('hex').slice(26, 28);
                let inav = parseInt(inav1 + inav0, 16)
                returnmsg.inav = inav;
                //取出输入电压_B相
                let inbv1 = rcmsg.toString('hex').slice(28, 30);
                let inbv0 = rcmsg.toString('hex').slice(30, 32);
                let inbv = parseInt(inbv1 + inbv0, 16)
                returnmsg.inbv = inbv;
                //取出输入电压_C相
                let incv1 = rcmsg.toString('hex').slice(32, 34);
                let incv0 = rcmsg.toString('hex').slice(34, 36);
                let incv = parseInt(incv1 + incv0, 16)
                returnmsg.incv = incv;
                //取出运行时间
                let realtime3 = rcmsg.toString('hex').slice(36, 38);
                let realtime2 = rcmsg.toString('hex').slice(38, 40);
                let realtime1 = rcmsg.toString('hex').slice(40, 42);
                let realtime0 = rcmsg.toString('hex').slice(42, 44);
                let realtime = parseInt(realtime3 + realtime2 + realtime1 + realtime0, 16)
                returnmsg.realtime = realtime;
                //取出环境温度
                let temperature1 = rcmsg.toString('hex').slice(44, 46);
                let temperature0 = rcmsg.toString('hex').slice(46, 48);
                let temperature = parseInt(temperature1 + temperature0, 16)
                returnmsg.temperature = temperature;
                //取出消息序列号
                let s0 = rcmsg.toString('hex').slice(48, 50);
                let s1 = rcmsg.toString('hex').slice(50, 52);
                let s2 = rcmsg.toString('hex').slice(52, 54);
                let s3 = rcmsg.toString('hex').slice(54, 56);
                let token = parseInt(s0 + s1 + s2 + s3, 16);
                returnmsg.token = token;
                //取出应答code
                let rcode = rcmsg.toString('hex').slice(56, 58);
                returnmsg.rcode = rcode;


                console.log("收到设备端的应答数据hex为：" + rcmsg.toString('hex'));
                console.log("收到设备端的应答数据解析为：");
                console.log(returnmsg);
                // msg = buf.toString('hex')
                msg = JSON.stringify(returnmsg)
                let res = {
                    token: token,
                    msg: msg
                }
                console.log("0x03应答消息的序列号======：" + s0 + s1 + s2 + s3);
                const key = token;
                const req = promisePool[key]
                if (req) {
                    req.resolve(res);
                    clearTimeout(req.timer);
                    console.log("=========0x03收到正确应答消息========，token=", token);
                    delete promisePool[key];
                } else {
                    console.log("=========0x03消息过期或不明消息========", token);
                }
                break;
            case 0x01://设置电源参数-应答处理
                console.log("0x01设置电源参数-应答处理，消息应答为：", rcmsg);
                let returnmsg01 = {}
                //取出消息类型
                let type01 = rcmsg.toString('hex').slice(2, 4);
                returnmsg01.type = type01;
                //取出协议长度
                let length01 = rcmsg.toString('hex').slice(4, 6);
                returnmsg01.length = length01;
                //取出设置电压值
                let setparamv11 = rcmsg.toString('hex').slice(6, 8);
                let setparamv00 = rcmsg.toString('hex').slice(8, 10);
                let setparamv01 = parseInt(setparamv11 + setparamv00, 16)
                returnmsg05.setparamv = setparamv01;
                //取出设置电流百分比值
                let setparamampercetage01 = rcmsg.toString('hex').slice(10, 12);

                returnmsg01.setparamampercetage = setparamampercetage01;
                //取出自主均流设置
                let shareamflag01 = rcmsg.toString('hex').slice(12, 14);

                returnmsg01.shareamflag = shareamflag01;
                //取出自动开机设置
                let autopoweronflag01 = rcmsg.toString('hex').slice(14, 16);

                returnmsg01.autopoweronflag = autopoweronflag01;
                //取出子模块额定功率
                let submoduleratedkw01 = rcmsg.toString('hex').slice(16, 18);

                returnmsg01.submoduleratedkw = submoduleratedkw01;
                //取出消息序列号
                let s00 = rcmsg.toString('hex').slice(18, 20);
                let s01 = rcmsg.toString('hex').slice(20, 22);
                let s02 = rcmsg.toString('hex').slice(22, 24);
                let s03 = rcmsg.toString('hex').slice(24, 26);
                let token01 = parseInt(s00 + s01 + s02 + s03, 16);
                returnmsg01.token = token01;
                //取出应答code
                let rcode01 = rcmsg.toString('hex').slice(26, 28);
                returnmsg01.rcode = rcode01;


                console.log("收到设备端的应答数据hex为：" + rcmsg.toString('hex'));
                console.log("收到设备端的应答数据解析为：");
                console.log(returnmsg01);

                msg = JSON.stringify(returnmsg01)
                let res01 = {
                    token: token01,
                    msg: msg
                }
                console.log("0x01应答消息的序列号======：", token01);
                const key01 = token01;
                const req01 = promisePool[key01]
                if (req01) {
                    req01.resolve(res01);
                    clearTimeout(req01.timer);
                    console.log("=========0x01收到正确应答消息========，token=", token01);
                    delete promisePool[key01];
                } else {
                    console.log("=========0x01消息过期或不明消息========", token01);
                }
                break;
                case 0x05://读取电源设置参数-应答处理
                console.log("0x05读取电源设置参数-应答处理，消息应答为：", rcmsg);
                let returnmsg05 = {}
                //取出消息类型
                let type05 = rcmsg.toString('hex').slice(2, 4);
                returnmsg05.type = type05;
                //取出协议长度
                let length05 = rcmsg.toString('hex').slice(4, 6);
                returnmsg05.length = length05;
                //取出设置电压值
                let setparamv1 = rcmsg.toString('hex').slice(6, 8);
                let setparamv0 = rcmsg.toString('hex').slice(8, 10);
                let setparamv = parseInt(setparamv1 + setparamv0, 16)
                returnmsg05.setparamv = setparamv;
                //取出设置电流百分比值
                let setparamampercetage = rcmsg.toString('hex').slice(10, 12);

                returnmsg05.setparamampercetage = setparamampercetage;
                //取出自主均流设置
                let shareamflag = rcmsg.toString('hex').slice(12, 14);

                returnmsg05.shareamflag = shareamflag;
                //取出自动开机设置
                let autopoweronflag = rcmsg.toString('hex').slice(14, 16);

                returnmsg05.autopoweronflag = autopoweronflag;
                //取出子模块额定功率
                let submoduleratedkw = rcmsg.toString('hex').slice(16, 18);

                returnmsg05.submoduleratedkw = submoduleratedkw;
                //取出消息序列号
                let s10 = rcmsg.toString('hex').slice(18, 20);
                let s11 = rcmsg.toString('hex').slice(20, 22);
                let s12 = rcmsg.toString('hex').slice(22, 24);
                let s13 = rcmsg.toString('hex').slice(24, 26);
                let token05 = parseInt(s10 + s11 + s12 + s13, 16);
                returnmsg05.token = token05;
                //取出应答code
                let rcode05 = rcmsg.toString('hex').slice(26, 28);
                returnmsg05.rcode = rcode05;


                console.log("收到设备端的应答数据hex为：" + rcmsg.toString('hex'));
                console.log("收到设备端的应答数据解析为：");
                console.log(returnmsg05);

                msg = JSON.stringify(returnmsg05)
                let res05 = {
                    token: token05,
                    msg: msg
                }
                console.log("0x05应答消息的序列号======：", token05);
                const key05 = token05;
                const req05 = promisePool[key05]
                if (req05) {
                    req05.resolve(res05);
                    clearTimeout(req05.timer);
                    console.log("=========0x05收到正确应答消息========，token=", token05);
                    delete promisePool[key05];
                } else {
                    console.log("=========0x05消息过期或不明消息========", token05);
                }
                break;
            case 0x06://读取电源子模块id-应答处理
                console.log("0x06读取电源设置参数-应答处理，消息应答为：", rcmsg);
                let returnmsg06 = {}
                //取出消息类型
                let type06 = rcmsg.toString('hex').slice(2, 4);
                returnmsg06.type = type06;
                //取出协议长度
                let length06 = rcmsg.toString('hex').slice(4, 6);
                returnmsg06.length = length06;
                //取出子模块数量
                let submodulenum = rcmsg.toString('hex').slice(6, 8);
                returnmsg06.submodulenum = submodulenum;
                let subidlist = []
                let i = 0
                let subid
                let position06 = 6
                for (i = 0; i < submodulenum; i++) {
                    position06 = position06 + 2
                    subid = rcmsg.toString('hex').slice(position06, position06 + 2);
                    subidlist.push(subid)
                }
                returnmsg06.submodulelist = subidlist;
                //取出消息序列号

                let s063 = rcmsg.toString('hex').slice(position06 + 2, position06 + 4);
                let s062 = rcmsg.toString('hex').slice(position06 + 4, position06 + 6);
                let s061 = rcmsg.toString('hex').slice(position06 + 6, position06 + 8);
                let s060 = rcmsg.toString('hex').slice(position06 + 8, position06 + 10);
                let token06 = parseInt(s063 + s062 + s061 + s060, 16);
                returnmsg06.token = token06;
                //取出应答code
                let rcode06 = rcmsg.toString('hex').slice(position06 + 10, position06 + 12);
                returnmsg06.rcode = rcode06;


                console.log("收到设备端的应答数据hex为：" + rcmsg.toString('hex'));
                console.log("收到设备端的应答数据解析为：");
                console.log(returnmsg06);

                msg = JSON.stringify(returnmsg06)
                let res06 = {
                    token: token06,
                    msg: msg
                }
                console.log("0x06应答消息的序列号======：", token06);
                const key06 = token06;
                const req06 = promisePool[key06]
                if (req06) {
                    req06.resolve(res06);
                    clearTimeout(req06.timer);
                    console.log("=========0x06收到正确应答消息========，token=", token06);
                    delete promisePool[key06];
                } else {
                    console.log("=========0x06消息过期或不明消息========", token06);
                }
                break;
            case 0x02://控制电源开关机-应答处理
                console.log("0x02控制电源开关机-应答处理，消息应答为：", rcmsg);
                let returnmsg02 = {}
                //取出消息类型
                let type02 = rcmsg.toString('hex').slice(2, 4);
                returnmsg02.type = type02;
                //取出协议长度
                let length02 = rcmsg.toString('hex').slice(4, 6);
                returnmsg02.length = length02;
                //取出子模块id
                let submoduleid02 = rcmsg.toString('hex').slice(6, 8);
                returnmsg02.submoduleid = submoduleid02;
                //取出开/关机
                let onoff02 = rcmsg.toString('hex').slice(8, 10);
                returnmsg02.onoff = onoff02;
               
                //取出消息序列号
                let position02 = 8
                let s023 = rcmsg.toString('hex').slice(position02 + 2, position02 + 4);
                let s022 = rcmsg.toString('hex').slice(position02 + 4, position02 + 6);
                let s021 = rcmsg.toString('hex').slice(position02 + 6, position02 + 8);
                let s020 = rcmsg.toString('hex').slice(position02 + 8, position02 + 10);
                let token02 = parseInt(s023 + s022 + s021 + s020, 16);
                returnmsg02.token = token02;
                //取出应答code
                let rcode02 = rcmsg.toString('hex').slice(position02 + 10, position02 + 12);
                returnmsg02.rcode = rcode02;


                console.log("收到设备端的应答数据hex为：" + rcmsg.toString('hex'));
                console.log("收到设备端的应答数据解析为：");
                console.log(returnmsg02);

                msg = JSON.stringify(returnmsg02)
                let res02 = {
                    token: token02,
                    msg: msg
                }
                console.log("0x02应答消息的序列号======：", token02);
                const key02 = token02;
                const req02 = promisePool[key02]
                if (req02) {
                    req02.resolve(res02);
                    clearTimeout(req02.timer);
                    console.log("=========0x02收到正确应答消息========，token=", token02);
                    delete promisePool[key02];
                } else {
                    console.log("=========0x02消息过期或不明消息========", token02);
                }
                break;
                case 0x04://读取电源告警信息-应答处理
                console.log("0x04读取电源告警信息-应答处理，消息应答为：", rcmsg);
                let returnmsg04 = {}
                //取出消息类型
                let type04 = rcmsg.toString('hex').slice(2, 4);
                returnmsg04.type = type04;
                //取出协议长度
                let length04 = rcmsg.toString('hex').slice(4, 6);
                returnmsg04.length = length04;
                //取出子模块数量
                let submoduleid = rcmsg.toString('hex').slice(6, 8);
                returnmsg04.submoduleid = submoduleid;
                //取出告警1
                let alarmbyte1 = rcmsg.toString('hex').slice(8, 10);
                let alarm1bit = {}
                let b1 = []
                b1[0] = (alarmbyte1 & 0x01) == 0x01 ? 1 : 0;
                b1[1] = (alarmbyte1 & 0x02) == 0x02 ? 1 : 0;
                alarm1bit.otp = b1[1]
                alarm1bit.oap = b1[0]
                returnmsg04.alarmbyte1 = alarm1bit;
                //取出告警2
                let alarm2bit = {}
                let b2 = []
                let alarmbyte2 = rcmsg.toString('hex').slice(10, 12);
                
                b2[0] = (alarmbyte2 & 0x01) == 0x01 ? 1 : 0;
                b2[1] = (alarmbyte2 & 0x02) == 0x02 ? 1 : 0;
                b2[2] = (alarmbyte2 & 0x04) == 0x04 ? 1 : 0;
                b2[3] = (alarmbyte2 & 0x08) == 0x08 ? 1 : 0;
                b2[4] = (alarmbyte2 & 0x10) == 0x10 ? 1 : 0;
                b2[5] = (alarmbyte2 & 0x20) == 0x20 ? 1 : 0;
                b2[6] = (alarmbyte2 & 0x40) == 0x40 ? 1 : 0;
                b2[7] = (alarmbyte2 & 0x80) == 0x80 ? 1 : 0;
                alarm2bit.poweronoff = b2[0]
                alarm2bit.powerfault = b2[1]
                alarm2bit.ocav = b2[2]
                alarm2bit.fanfault = b2[3]
                alarm2bit.iov = b2[4]
                alarm2bit.iuv = b2[5]
                alarm2bit.oov = b2[6]
                alarm2bit.ouv = b2[7]
                returnmsg04.alarmbyte2 = alarm2bit;
                //取出消息序列号
                let position04 = 10
                let s043 = rcmsg.toString('hex').slice(position04 + 2, position04 + 4);
                let s042 = rcmsg.toString('hex').slice(position04 + 4, position04 + 6);
                let s041 = rcmsg.toString('hex').slice(position04 + 6, position04 + 8);
                let s040 = rcmsg.toString('hex').slice(position04 + 8, position04 + 10);
                let token04 = parseInt(s043 + s042 + s041 + s040, 16);
                returnmsg04.token = token04;
                //取出应答code
                let rcode04 = rcmsg.toString('hex').slice(position04 + 10, position04 + 12);
                returnmsg04.rcode = rcode04;


                console.log("收到设备端的应答数据hex为：" + rcmsg.toString('hex'));
                console.log("收到设备端的应答数据解析为：");
                console.log(returnmsg04);

                msg = JSON.stringify(returnmsg04)
                let res04 = {
                    token: token04,
                    msg: msg
                }
                console.log("0x04应答消息的序列号======：", token04);
                const key04 = token04;
                const req04 = promisePool[key04]
                if (req04) {
                    req04.resolve(res04);
                    clearTimeout(req04.timer);
                    console.log("=========0x04收到正确应答消息========，token=", token04);
                    delete promisePool[key04];
                } else {
                    console.log("=========0x04消息过期或不明消息========", token04);
                }
                break;
            default:

        }

    }

    let searchMsg = [0xaa, 0x12, 0x15, 0xee, 0x03, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x77];
    //server.send(Buffer.from(searchMsg), 0, Buffer.from(searchMsg).length, rinfo.port, rinfo.address);
    //console.log("发给客户端的数据为：",Buffer.from(searchMsg));
});

server.on("listening", function () {
    let address = server.address();
    console.log("socket服务器开始监听。地址信息为", address);
});

// power service
class PowerService extends Service {
    //get session ID
    async getSessionID() {

        if (session > 65535)
            session = 0;

        session = session + 1;
        //this.ctx.app.io.emit('s',"w");   
        //console.log("调用了websocket。。。。")
        return session;
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
        await server.send(buf, 0, buf.length, 7300, powerip, function (err, bytes) {
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
    async sendMsgPromiseTimeout(token, msg, powerip) {


        // send msg to device
        let buf = new Buffer.from(msg)
        let returncode = 0
        server.send(buf, 0, buf.length,7300, powerip, function (err, bytes) {
            returncode = err
            if (err) {
                console.log('send data err');
            } else {
                console.log("send data length=:", bytes);
            }
        });
        // return promise
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
module.exports = PowerService;
