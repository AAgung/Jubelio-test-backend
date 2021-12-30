const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NODE_ENV == 'test' ? process.env.DATABASE_TEST_URL : process.env.DATABASE_URL
});

pool.on('connect', () => {
  if(process.env.NODE_ENV == 'development') console.log('Database is connected');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
