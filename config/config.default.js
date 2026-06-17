/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1606976958352_2812';

  //loger
  config.logger = {
    level: 'NONE',
  }

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    myAppName: 'egg',
  };
  config.security = {
    csrf: {
        enable: false,
        ignoreJSON: false, 
    },
    domainWhiteList: ['http://power.eyeplus.com','http://power.eyeplus.com:7001']
};
  config.cors = {
    origin: 'http://123.57.87.144',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
};

  config.io = {
    init: { }, // passed to engine.io
    namespace: {
      '/': { },
       },
  };

  return {
    ...config,
    ...userConfig,
  };
};
