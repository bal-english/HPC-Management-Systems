
var parse = require('pg-connection-string').parse;

const { Pool, Client } = require('pg');
const connectionString = 'postgresql://admin:password@cmsdb:5432/db'

const pool = new Pool({
  connectionString: connectionString,
});

pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
});

const client = new Client({
  connectionString: connectionString,
});

client.connect();

client.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  client.end()
});