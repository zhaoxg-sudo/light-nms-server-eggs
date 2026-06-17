// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportDb = require('../../../app/service/db');
import ExportPower = require('../../../app/service/power');
import ExportPowerac = require('../../../app/service/powerac');
import ExportPowerbox = require('../../../app/service/powerbox');
import ExportPowerclsd = require('../../../app/service/powerclsd');
import ExportTcp = require('../../../app/service/tcp');

declare module 'egg' {
  interface IService {
    db: AutoInstanceType<typeof ExportDb>;
    power: AutoInstanceType<typeof ExportPower>;
    powerac: AutoInstanceType<typeof ExportPowerac>;
    powerbox: AutoInstanceType<typeof ExportPowerbox>;
    powerclsd: AutoInstanceType<typeof ExportPowerclsd>;
    tcp: AutoInstanceType<typeof ExportTcp>;
  }
}
