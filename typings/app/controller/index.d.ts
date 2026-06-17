// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAlarm = require('../../../app/controller/alarm');
import ExportData = require('../../../app/controller/data');
import ExportDefault = require('../../../app/controller/default');
import ExportDeviceac = require('../../../app/controller/deviceac');
import ExportDevicebox = require('../../../app/controller/devicebox');
import ExportDeviceclsd = require('../../../app/controller/deviceclsd');
import ExportDevicelocal = require('../../../app/controller/devicelocal');
import ExportHome = require('../../../app/controller/home');
import ExportTcp = require('../../../app/controller/tcp');
import ExportTopo = require('../../../app/controller/topo');
import ExportUser = require('../../../app/controller/user');

declare module 'egg' {
  interface IController {
    alarm: ExportAlarm;
    data: ExportData;
    default: ExportDefault;
    deviceac: ExportDeviceac;
    devicebox: ExportDevicebox;
    deviceclsd: ExportDeviceclsd;
    devicelocal: ExportDevicelocal;
    home: ExportHome;
    tcp: ExportTcp;
    topo: ExportTopo;
    user: ExportUser;
  }
}
