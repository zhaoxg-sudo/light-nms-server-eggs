'use strict';
const { Pool } = require('pg');

const pgPool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'power',
  password: 'shyh2017',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000
});

pgPool.on('error', (err) => {
  console.error('pgPool unexpected error:', err);
});

module.exports = pgPool;
