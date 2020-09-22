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

const getUsersById = (req, res) => {
	const { min, max } = req.body;

	pool.query('SELECT * FROM \"user\" WHERE id > $1 AND id < $2', [min, max], (error, results) => {
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
	
	pool.query('UPDATE \"user\" SET \"lastName\" = $2, \"firstName\" = $3, \"email\" = $4 WHERE id = $1', [id, lastName, firstName, email], (error, results) => {
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

const getBloggroups = (req, res) => {
	pool.query('SELECT * FROM \"bloggroup\"', (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const getBloggroupById = (req, res) => {
	const id = parseInt(req.params.id);
	pool.query('SELECT * FROM \"bloggroup\" WHERE id = $1', [id], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const createUsergroup = (req, res) => {
	const { name } = req.body;
	pool.query('INSERT INTO \"usergroup\" (\"name\") VALUES ($1)', [name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Usergroup added with ID: ${results.rows[0].id}\n`);
	})
}

const createBloggroup = (req, res) => {
	const { name } = req.body;
	pool.query('INSERT INTO \"bloggroup\" (\"name\") VALUES ($1)', [name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Bloggroup added with ID: ${results.rows[0].id}\n`);
	})
}

const updateBloggroup = (req, res) => {
	const { id, name, parent } = req.body;
	pool.query("UPDATE \"bloggroup\" SET \"name\"=$2 \"parent\"=$3 WHERE \"id\"=$1", [id, name, parent], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).send(`Bloggroup with ID: ${results.rows[0].id} updated with name: ${results.rows[0].name} and parent: ${results.rows[0].parent}\n`);
	})
}

//const updateBloggroupName
//const updateBloggroupParent

const getUsergroups = (req, res) => {
	pool.query('SELECT * FROM \"usergroup\"', (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const getUsergroupById = (req, res) => {
	const id = parseInt(req.params.id);
	pool.query('SELECT * FROM \"usergroup\" WHERE id = $1', [id], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}


const updateUsergroup = (req, res) => {
	const { id, name } = req.body;
	pool.query("UPDATE \"usergroup\" SET \"name\"=$2 WHERE \"id\"=$1", [id, name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).send(`Usergroup with ID: ${results.rows[0].id} updated with name: ${results.rows[0].name}\n`);
	})
}

const createBlog = (req, res) => {
	const { title, author, body } = req.body;
	pool.query('INSERT INTO \"blog\" (\"title\", \"author\", \"body\") VALUES ($1, $2, $3)' [title, author, body], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Blog created with ID: ${results.rows[0].id}\n`);
	})
}

const getBlogs = (req, res) => {
	pool.query('SELECT * FROM \"blog\"', [], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows)
	})
}

const groupBlog = (req, res) => {
	const { blog_id, group_id } = req.body;
	pool.query('UPDATE \"blog\" SET \"group\"=$2 WHERE id=$1', [blog_id, group_id], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).send(`Blog with ID: ${results.rows[0].id} put in group with ID: ${results.rows[0].id}\n`);
	})
}

const createTicket = (req, res) => {
	const { creator, title, body } = req.body;

	pool.query('INSERT INTO \"ticket\" (\"lastName\", \"firstName\", \"email\", \"title\", \"body\") VALUES ($1, $2, $3, $4, $5) RETURNING \"id\"', [lastName, firstName, email, title, body], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Ticket added with ID: ${results.rows[0].id}\n`);
	})
}

const getTickets = (req, res) => {
	
	pool.query('SELECT * FROM \"ticket\"', [], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const getTicketById = (req, res) => {
	const id = parseInt(req.params.id);

	pool.query('SELECT * FROM \"ticket\" WHERE id = $1', [id], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const getPermissions = (req, res) => {
	pool.query('SELECT * FROM \"permission\"', (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const getPermissionById = (req, res) => {
	const id = parseInt(req.params.id);

	pool.query('SELECT * FROM \"permission\" WHERE id = $1', [id], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	})
}

const updatePermission = (req, res) => {
	const id = parseInt(req.params.id);
	const { name } = req.body;
	
	pool.query('UPDATE \"permission\" SET \"name\" = $2 WHERE id = $1', [id, name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).send(`Permission modified with ID: ${id}\n`);
	})
}

const createPermission = (req, res) => {
	const { name } = req.body;
	pool.query('INSERT INTO \"permission\" (\"name\") VALUES ($1)' [name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Permission created with ID: ${results.rows[0].id}\n`);
	})
}


module.exports = {
	getUsers,
	getUserById,
	getUsersById,
	createUser,
	updateUser,
	deleteUser,
	getBloggroups,
	getBloggroupById,
	getUsergroups,
	getUsergroupById,
	createUsergroup,
	createBloggroup,
	updateBloggroup,
	updateUsergroup,
	getBlogs,
	createBlog,
	groupBlog,
	createTicket,
	getTickets,
	getTicketById,
	getPermissions,
	getPermissionById,
	updatePermission,
	createPermission
}
