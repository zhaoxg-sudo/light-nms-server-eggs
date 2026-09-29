'use strict';

const { Service } = require('egg');
const pool = require('../pgpool');

class SysOperLogService extends Service {

  /**
   * 写入操作日志
   * @param {Object} logItem
   */
  async insertLog(logItem) {
    const sql = `
INSERT INTO sys_oper_log (
  user_id,
  user_name,
  user_org,
  oper_type,
  oper_desc,
  request_url,
  request_method,
  request_params,
  ip,
  status,
  error_msg,
  cost_time,
  create_at,
  local_inner_ips
) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
`;
    const values = [
      logItem.user_id || '',
      logItem.user_name || '',
      logItem.user_org || '',
      logItem.oper_type || '',
      logItem.oper_desc || '',
      logItem.request_url || '',
      logItem.request_method || '',
      logItem.request_params || '',
      logItem.ip || '',
      logItem.status !== undefined ? logItem.status : 1,
      logItem.error_msg || '',
      logItem.cost_time || 0,
      new Date(),
      logItem.local_inner_ips || ''
    ];

    let data = await pool.query(sql, values)
    return data
  }

  /**
   * 分页查询操作日志
   * @param {Object} query
   * @returns {{total:number, list:Array}}
   */
  async getPageList(query) {
    const { page = 1, pageSize = 10, user_name, oper_type } = query;

    let whereParts = [];
    const params = [];
    let idx = 1;

    if (user_name) {
      whereParts.push(`user_name LIKE $${idx}`);
      params.push('%' + user_name + '%');
      idx = idx + 1;
    }
    if (oper_type) {
      whereParts.push(`oper_type = $${idx}`);
      params.push(oper_type);
      idx = idx + 1;
    }

    const whereSql = whereParts.length > 0 ? 'WHERE ' + whereParts.join(' AND ') : '';

    const countSql = `SELECT COUNT(id) AS total FROM sys_oper_log ${whereSql}`;
    const countRes = await pool.query(countSql, params);
    const total = Number(countRes.rows[0].total);

    const offset = (page - 1) * pageSize;
    const listSql = `
SELECT * FROM sys_oper_log
${whereSql}
ORDER BY create_at DESC
LIMIT $${idx} OFFSET $${idx+1}
`;
    params.push(pageSize);
    params.push(offset);

    const listRes = await pool.query(listSql, params);
    return {
      total: total,
      list: listRes.rows
    };
  }
}

module.exports = SysOperLogService;
