const Pool = require('pg').Pool;
const pool = new Pool();

const getUsers = () => {
	return pool.query('SELECT * FROM \"user\"', []);
}

const getUserById = (u_id) => {
	return pool.query('SELECT * FROM \"user\" WHERE id = $1', [u_id]);
}

const getUsersById = (min, max) => {
	return pool.query('SELECT * FROM \"user\" WHERE id >= $1 AND id <= $2', [min, max]);
}

/*
const createUser = (req, res) => {
	const { lastName, firstName, email } = req.body;

	pool.query('INSERT INTO \"user\" (\"lastName\", \"firstName\", \"email\") VALUES ($1, $2, $3) RETURNING \"id\"', [lastName, firstName, email], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`User added with ID: ${results.rows[0].id}\n`);
	})
}
*/
/*
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
*/
/*
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
*/

const getBloggroups = () => {
	return pool.query('SELECT * FROM \"bloggroup\"', []);
}

const getBloggroupById = (u_id) => {
	return pool.query('SELECT * FROM \"bloggroup\" WHERE id = $1', [u_id]);
}

const getBloggroupByName = (name) => {
	return pool.query('SELECT * FROM \"bloggroup\" WHERE name = $1', [name]);
}

/*
const createUsergroup = (req, res) => {
	const { name } = req.body;
	pool.query('INSERT INTO \"usergroup\" (\"name\") VALUES ($1)', [name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Usergroup added with ID: ${results.rows[0].id}\n`);
	})
}
*/
/*
const createBloggroup = (req, res) => {
	const { name } = req.body;
	pool.query('INSERT INTO \"bloggroup\" (\"name\") VALUES ($1)', [name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Bloggroup added with ID: ${results.rows[0].id}\n`);
	})
}
*/
/*
const updateBloggroup = (req, res) => {
	const { id, name, parent } = req.body;
	pool.query("UPDATE \"bloggroup\" SET \"name\"=$2 \"parent\"=$3 WHERE \"id\"=$1", [id, name, parent], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).send(`Bloggroup with ID: ${results.rows[0].id} updated with name: ${results.rows[0].name} and parent: ${results.rows[0].parent}\n`);
	})
}
*/

const getUsergroups = () => {
	return pool.query('SELECT * FROM \"usergroup\"', []);
}

const getUsergroupById = (u_id) => {
	return pool.query('SELECT * FROM \"usergroup\" WHERE id = $1', [u_id]);
}

/*
const updateUsergroup = (req, res) => {
	const { id, name } = req.body;
	pool.query("UPDATE \"usergroup\" SET \"name\"=$2 WHERE \"id\"=$1", [id, name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).send(`Usergroup with ID: ${results.rows[0].id} updated with name: ${results.rows[0].name}\n`);
	})
}
*/
/*
const createBlog = (req, res) => {
	const { title, author, body } = req.body;
	pool.query('INSERT INTO \"blog\" (\"title\", \"author\", \"body\") VALUES ($1, $2, $3)' [title, author, body], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Blog created with ID: ${results.rows[0].id}\n`);
	})
}
*/

const getBlogs = () => {
	return pool.query('SELECT * FROM \"blog\" ORDER BY \"posttime\" DESC', []);
}

const getBlogById = (blog_id) => {
	return pool.query('SELECT * FROM \"blog\" WHERE id=$1', [blog_id]);
}

const getBlogsByAuthorId = (auth_id) => {
	return pool.query('SELECT * FROM \"blog\" WHERE author=$1', [auth_id]);
}

/*
const getBlogsAfterBlogId = (req, res) => {
	const after_blog = parseInt(req.params.after);
	pool.query('SELECT * FROM \"blog\" WHERE \"id\">$1 ORDER BY \"posttime\" DESC' , [after_blog], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows)
	})
}
*/
/*
const getBlogsAfterTime = (req, res) => {
	const ts = req.params.date + " " + req.params.time;
	pool.query('SELECT * FROM \"blog\" WHERE \"posttime\">=to_timestamp($1, \'yyyy-mm-dd hh24:mi:ss\') ORDER BY \"posttime\" DESC', [ts], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows)
	})
}
*/

const getBlogsByGroupId = (g_id) => {
	return pool.query('SELECT * FROM \"blog\" WHERE \"group\" = $1', [g_id]);
}

const getBlogsByGroupIdAfterTime = (g_id, ts) => {
	return pool.query('SELECT * FROM \"blog\" WHERE \"group\"=$1 AND \"posttime\">to_timestamp($2, \'yyyy-mm-dd hh24:mi:ss\') ORDER BY \"posttime\" DESC' , [group_id, ts]);
}

const getBlogsByGroupIdOffsetBy = (g_id, offset) => {
	return pool.query('SELECT * FROM \"blog\" WHERE \"group\"=$1 ORDER BY \"posttime\" DESC OFFSET $2 LIMIT 3', [g_id, offset]);
}
/*
const groupBlog = (req, res) => {
	const { blog_id, group_id } = req.body;
	pool.query('UPDATE \"blog\" SET \"group\"=$2 WHERE id=$1', [blog_id, group_id], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).send(`Blog with ID: ${results.rows[0].id} put in group with ID: ${results.rows[0].id}\n`);
	})
}
*/
/*
const createTicket = (req, res) => {
	const { creator, title, body } = req.body;

	pool.query('INSERT INTO \"ticket\" (\"lastName\", \"firstName\", \"email\", \"title\", \"body\") VALUES ($1, $2, $3, $4, $5) RETURNING \"id\"', [lastName, firstName, email, title, body], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Ticket added with ID: ${results.rows[0].id}\n`);
	})
}
*/

const getTickets = () => {
	return pool.query('SELECT * FROM \"ticket\"', []);
}

const getTicketsForUser = (u_id) => {
	return pool.query('SELECT * FROM \"ticket\" WHERE creator = $1', [u_id]);
}

const getTicketById = (u_id) => {
	return pool.query('SELECT * FROM \"ticket\" WHERE id = $1', [u_id]);
}

const getPermissions = () => {
	return pool.query('SELECT * FROM \"permission\"', []);
}

const getPermissionById = (p_id) => {
	return pool.query('SELECT * FROM \"permission\" WHERE id = $1', [p_id]);
}

/*
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
*/
/*
const createPermission = (req, res) => {
	const { name } = req.body;
	pool.query('INSERT INTO \"permission\" (\"name\") VALUES ($1)' [name], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(201).send(`Permission created with ID: ${results.rows[0].id}\n`);
	})
}
*/

module.exports = {
	getUsers,
	getUserById,
	getUsersById,
	//createUser,
	//updateUser,
	//deleteUser,
	getBloggroups,
	getBloggroupById,
	getBloggroupByName,
	getUsergroups,
	getUsergroupById,
	//createUsergroup,
	//createBloggroup,
	//updateBloggroup,
	//updateUsergroup,
	getBlogById,
	getBlogs,
	getBlogsByAuthorId,
	//getBlogsAfterTime,
	//getBlogsAfterBlogId,
	getBlogsByGroupId,
	getBlogsByGroupIdAfterTime,
	getBlogsByGroupIdOffsetBy,
	//getBlogsByGroupIdOffsetBy_COUNT,
	//createBlog,
	//groupBlog,
	//createTicket,
	getTickets,
	getTicketsForUser,
	getTicketById,
	getPermissions,
	getPermissionById//,
	//updatePermission,
	//createPermission
}
