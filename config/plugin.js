'use strict';

/** @type Egg.EggPlugin */
module.exports.io = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  enable: true,
  package: 'egg-socket.io',
};
module.exports.cors = {
  enable: true,
  package: 'egg-cors',
};
