const Pool = require('pg').Pool;
const pool = new Pool();

const getUserCount = () => {
	return pool.query('SELECT count(*) FROM \"user\"', []);
}

const getTicketCount = () => {
	return pool.query('SELECT count(*) FROM \"ticket\"', []);
}

const getTicketCountOfUser = (u_id) => {
	const user_id = parseInt(u_id);
	return pool.query('SELECT count(*) FROM \"ticket\" WHERE creator = $1', [user_id]);
}

const getCountOfBlogs = () => {
	return pool.query('SELECT count(*) FROM (SELECT * FROM \"blog\" ORDER BY \"posttime\" DESC) AS \"table\"' , []);
}

const getBlogCountByUser = (u_id) => {
	const user_id = parseInt(u_id);
	return pool.query('SELECT count(*) FROM (SELECT * FROM \"blog\" WHERE id=$1 ORDER BY \"posttime\" DESC) AS \"table\"', [user_id])
}

const getCountOfBlogsByGroupId = (g_id) => {
	const group_id = parseInt(g_id);
	return pool.query('SELECT count(*) FROM (SELECT * FROM \"blog\" WHERE \"group\"=$1 ORDER BY \"posttime\" DESC) AS \"table\"' , [group_id]);
}

const getCountOfBlogsOffsetBy = (offset) => {
	return pool.query('SELECT count(*) FROM (SELECT * FROM \"blog\" ORDER BY \"posttime\" DESC OFFSET $1) AS \"table\"' , [offset]);
}

const getCountOfBlogsByGroupIdOffsetBy = (g_id, offset) => {
	return pool.query('SELECT count(*) FROM (SELECT * FROM \"blog\" WHERE \"group\"=$1 ORDER BY \"posttime\" DESC OFFSET $2) AS \"table\"' , [g_id, offset]);
}

module.exports = {
	getUserCount,
	getTicketCount,
	getTicketCountOfUser,
	getCountOfBlogs,
	getBlogCountByUser,
	getCountOfBlogsByGroupId,
	getCountOfBlogsOffsetBy,
	getCountOfBlogsByGroupIdOffsetBy
}
