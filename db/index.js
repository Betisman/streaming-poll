const initHandyPg = require('handy-postgres');

const CONFIG = {
  pg: {
    user: process.env.DATABASE_USER || 'postgres',
    database: process.env.DATABASE_NAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    host: process.env.DATABASE_HOST || 'host',
    port: process.env.DATABASE_PORT || '5432',
    max: process.env.DATABASE_MAX_CONNECTIONS || 5,
    sql: process.env.DATABASE_SQL_FOLDER || 'db/sql',
    idleTimeoutMillis: process.env.DATABASE_TIMEOUT_MILLIS || 30000,
    migrations: [{
      directory: 'db/migrations',
      namespace: 'test',
      filter: '\\.sql$',
    }],
  },
};


module.exports = () => {
  let handyPg;

  const start = async (args = {}) => {
    const { config } = args;
    handyPg = initHandyPg({ })
    const api = await handyPg.start(config || CONFIG);
    return api;
  };

  const stop = () => handyPg.stop();

  return { start, stop };
};
