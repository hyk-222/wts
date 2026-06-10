const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.WTS_DB_HOST || '10.19.120.241',
  port: Number(process.env.WTS_DB_PORT || 3306),
  database: process.env.WTS_DB_NAME || 'wts_activity',
  user: process.env.WTS_DB_USER || 'wts',
  password: process.env.WTS_DB_PASSWORD || 'wts_123',
  waitForConnections: true,
  connectionLimit: Number(process.env.WTS_DB_POOL_SIZE || 5),
  queueLimit: 0,
  timezone: '+08:00',
  ssl: process.env.WTS_DB_SSL === 'true' ? {} : undefined,
};

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }

  return pool;
}

async function testConnection() {
  const startedAt = Date.now();
  const [rows] = await getPool().query(
    'SELECT 1 AS ok, DATABASE() AS databaseName, VERSION() AS version'
  );

  return {
    ok: rows[0]?.ok === 1,
    databaseName: rows[0]?.databaseName || dbConfig.database,
    version: rows[0]?.version || '',
    host: dbConfig.host,
    port: dbConfig.port,
    elapsedMs: Date.now() - startedAt,
  };
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = {
  closePool,
  testConnection,
};
