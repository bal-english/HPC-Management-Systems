const { Pool, Client } = require('pg')

const pool = new Pool()

pool.query('SELECT NOW', (err, res) => {
	console.log(err, res)
	pool.end()
})

const client = new Client();
/*await*/ client.connect();


const res = /*await*/ client.query('SELECT NOW()');
/*await*/ client.end();
