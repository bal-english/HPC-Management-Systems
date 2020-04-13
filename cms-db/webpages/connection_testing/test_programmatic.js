const { Pool, Client} = require('pg');

var connstr = 'postgresql://admin:password@db:5432/db'

const pool = new Pool({
	user: 'admin',
	host: 'db',
	database: 'db',
	password: 'password',
	port: 5432,
})

pool.query('SELECT NOW()', (err, res) => {
	console.log(err, res)
	pool.end()
})

const client = new Client({
	user: 'admin',
	host: 'db',
	database: 'db',
	password: 'password',
	port: 5432,	
})
client.connect()

client.query('SELECT NOW()', (err, res) => {
	console.log(err, res)
	client.end()
})

//postgresql://admin:password@db:5432/db
