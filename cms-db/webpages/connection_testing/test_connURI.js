const { Pool, Client} = require('pg');

var connstr = 'postgresql://admin:password@db:5432/db'

//const pool = new Pool();
const pool = new Pool({
	connectionString: connstr,
})

pool.query('SELECT NOW()', (err, res) => {
	console.log(err, res)
	pool.end()
})

//const res = await pool.query('SELECT NOW()')
//await pool.end()

const client = new Client({
	connectionString: connstr,
})
client.connect()

client.query('SELECT NOW()', (err, res) => {
	console.log(err, res)
	client.end()
})

//postgresql://admin:password@db:5432/db
