'use strict';

/**
 * 清洗客户端ip，去除 ::ffff: 前缀
 * @param {Object} req ctx.req
 * @returns {string}
 */
function getCleanClientIp(req) {
  let ip = '';
  if (req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for'].split(',')[0].trim();
  } else {
    if (req.connection && req.connection.remoteAddress) {
      ip = req.connection.remoteAddress;
    } else if (req.socket && req.socket.remoteAddress) {
      ip = req.socket.remoteAddress;
    }
  }
  if (ip.indexOf('::ffff:') === 0) {
    ip = ip.slice(7);
  }
  return ip || '';
}

module.exports = {
  getCleanClientIp
};
