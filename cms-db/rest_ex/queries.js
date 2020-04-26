const Pool = require('pg').Pool;
const pool = new Pool();

const getUsers = (req, res) => {
	pool.query('SELECT * FROM \"user\"', (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const getUserById = (req, res) => {
	const id = parseInt(req.params.id);

	pool.query('SELECT * FROM \"user\" WHERE id = $1', [id], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const createUser = (req, res) => {
	const { lastName, firstName, email } = req.body;

	pool.query('INSERT INTO \"user\" (\"lastName\", \"firstName\", \"email\") VALUES ($1, $2, $3) RETURNING \"id\"', [lastName, firstName, email], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`User added with ID: ${results.rows[0].id}\n`);
	})
}

const updateUser = (req, res) => {
	const id = parseInt(req.params.id);
	const { lastName, firstName, email } = req.body;
	
	pool.query('UPDATE \"user\" SET \"lastName\" = $1, \"firstName\" = $2, \"email\" = $3 WHERE id = $4', [lastName, firstName, email], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).send(`User modified with ID: ${id}\n`);
	})
}

const deleteUser = (req, res) => {
	const id = parseInt(req.params.id);
	const reason = req.params.reason;

	pool.query('INSERT INTO \"hidden-user\" (\"id\", \"reason\") VALUES ($1, $2)', [id, reason], (error, results) => {
		if(error) {
			throw error; 
		}
		res.status(200).send(`User hidden with ID: ${id}\n`);
	})
}

const createUsergroup = (req, res) => {
	const { name } = req.body;
	pool.query('INSERT INTO \"usergroup\" (\"name\") VALUES ($1)', [name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Usergroup added with ID: ${results.id}\n`);
	})
}

const createBloggroup = (req, res) => {
	const { name } = req.body;
	pool.query('INSERT INTO \"bloggroup\" (\"name\") VALUES ($1)', [name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Bloggroup added with ID: ${results.id}\n`);
	})
}

const createBlog = (req, res) => {
	const { title, author, body } = req.body;
	pool.query('INSERT INTO \"blog\" (\"title\", \"author\", \"body\") VALUES ($1, $2, $3)' [title, author, body], (error, results) => {
		if(error) {
			throw error
		}
		res.status(200).send(`Blog created with ID: ${results.id}\n`);
	})
}

//const groupBlog = (req, res) => {
//	const { id

module.exports = {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	createUsergroup,
	createBloggroup,
	createBlog
}
