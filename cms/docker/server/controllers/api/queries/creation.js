const Pool = require('pg').Pool;
const pool = new Pool();

const makeNonce = () => {
	return parseInt(Math.floor(Math.random()*4294967296)-2147483648);
}

const user = async (lastName, firstName, email) => {
	const nonce = parseInt(makeNonce());
	return pool.query('INSERT INTO \"user\" (\"lastName\", \"firstName\", \"email\", \"nonce\") VALUES ($1, $2, $3, $4) RETURNING \"id\", \"nonce\"', [lastName, firstName, email, nonce])
}

const blog = (title, author, group, body) => {
	return pool.query('INSERT INTO \"blog\" (\"title\", \"author\", \"group\", \"body\") VALUES ($1, $2, $3, $4) RETURNING \"id\"', [title, author, group, body]);
}

const ticket = (email, title, body) => {
	return pool.query('INSERT INTO \"ticket\" (\"creator\", \"title\", \"body\") VALUES ($1, $2, $3) RETURNING \"id\"', [email, title, body]);
}

module.exports = {
	user,
  blog,
  ticket,
}
