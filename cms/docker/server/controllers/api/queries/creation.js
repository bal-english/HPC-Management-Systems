const Pool = require('pg').Pool;
const pool = new Pool();

const blog = (title, author, group, body) => {
	return pool.query('INSERT INTO \"blog\" (\"title\", \"author\", \"group\", \"body\") VALUES ($1, $2, $3, $4) RETURNING \"id\"', [title, author, group, body]);
}

const ticket = (email, title, body) => {
	return pool.query('INSERT INTO \"ticket\" (\"creator\", \"title\", \"body\") VALUES ($1, $2, $3) RETURNING \"id\"', [email, title, body]);
}

module.exports = {
  blog,
  ticket
}
