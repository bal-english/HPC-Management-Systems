const Pool = require('pg').Pool;
const pool = new Pool();

const getBlogByGroup = (req, res) => {
	const group = req.params.groupId;
	pool.query('SELECT * FROM \"blog\" WHERE category == $group', (error, results) => {
		if(error){
			throw error;
		}
		res.status(200).json(results.rows);
	});
}

const getBlogById = (req, res) => {
	const id = parseInt(req.params.id);
	
	pool.query('SELECT * FROM \"blog\" WHERE id = $1', [id], (error, results) => {
		if(error){
		  throw error;
		}
		res.status(200).send(results.rows);
	})
}

const getBlogByTitle = (req, res) => {
	const name = req.body;

	pool.query('SELECT * FROM \"blog\" WHERE title = $1', [name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})

}


const getUsersByFirstname = (req, res) => {
	const first_name = req.params.firstName
	pool.query('SELECT * FROM \"user\" WHERE firstName = $1', [first_name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const getUsersByLastname = (req, res) => {
	const last_name = req.params.lastName
	pool.query('SELECT * FROM \"user\" WHERE lastName = $1', [last_name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const getUsersByEmail = (req, res) => {
	const email = req.params.email
	pool.query('SELECT * FROM \"user\" WHERE email = $1', [email], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

module.exports = {
	getBlogByGroup,
	getBlogById,
	getBlogByTitle,
	getUsersByFirstname,
	getUsersByLastname,
	getUsersByEmail
}