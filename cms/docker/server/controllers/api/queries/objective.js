const Pool = require('pg').Pool;
const pool = new Pool();

const getUsers = () => {
	return pool.query('SELECT * FROM \"user\"', []);
}

const getUserById = (u_id) => {
	return pool.query('SELECT * FROM \"user\" WHERE id = $1', [u_id]);
}

const getUserByEmail = async (email) => {
	return pool.query('SELECT * FROM \"user\" WHERE email=$1', [email]);
}

const getUserNameById = (u_id) => {
	return pool.query('SELECT firstName, lastName FROM \"user\" WHERE id = $1' [u_id]);
}

const getUsersById = (min, max) => {
	return pool.query('SELECT * FROM \"user\" WHERE id >= $1 AND id <= $2', [min, max]);
}

const getUsergroupsOfUser = (u_id) => {
	return pool.query('SELECT * FROM \"user-usergroup\" WHERE user_id = $1', [u_id]);
}

const getBloggroups = () => {
	return pool.query('SELECT * FROM \"bloggroup\"', []);
}

const getBloggroupById = (u_id) => {
	return pool.query('SELECT * FROM \"bloggroup\" WHERE id = $1', [u_id]);
}

const getBloggroupByName = (name) => {
	return pool.query('SELECT * FROM \"bloggroup\" WHERE name = $1', [name]);
}

const getUsergroups = () => {
	return pool.query('SELECT * FROM \"usergroup\"', []);
}

const getUsergroups_def = (def) => {
	return pool.query('SELECT * FROM \"usergroup\" WHERE def = $1', [def]);
}

const getUsergroupById = (u_id) => {
	return pool.query('SELECT * FROM \"usergroup\" WHERE id = $1', [u_id]);
}

const getBlogs = () => {
	return pool.query('SELECT * FROM \"blog\" ORDER BY \"posttime\" DESC', []);
}

const getBlogById = (blog_id) => {
	return pool.query('SELECT * FROM \"blog\" WHERE id=$1', [blog_id]);
}

const getBlogsByAuthorId = (auth_id) => {
	return pool.query('SELECT * FROM \"blog\" WHERE author=$1', [auth_id]);
}

const getBlogsByGroupId = (g_id) => {
	return pool.query('SELECT * FROM \"blog\" WHERE \"group\" = $1', [g_id]);
}

const getBlogsOffsetBy = (offset) => {
	return pool.query('SELECT * FROM \"blog\" ORDER BY \"posttime\" DESC OFFSET $1', [offset])
}

const getBlogsSubset = (offset, limit) => {
	return pool.query('SELECT * FROM \"blog\" ORDER BY \"posttime\" DESC OFFSET $1 LIMIT $2', [offset, limit])
}

const getBlogsByGroupIdAfterTime = (g_id, ts) => {
	return pool.query('SELECT * FROM \"blog\" WHERE \"group\"=$1 AND \"posttime\">to_timestamp($2, \'yyyy-mm-dd hh24:mi:ss\') ORDER BY \"posttime\" DESC' , [group_id, ts]);
}

const getBlogsByGroupIdOffsetBy = (g_id, offset) => {
	return pool.query('SELECT * FROM \"blog\" WHERE \"group\"=$1 ORDER BY \"posttime\" DESC OFFSET $2 LIMIT 3', [g_id, offset]);
}

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

const getPermissions_def = (def) => {
	return pool.query('SELECT * FROM \"permission\" WHERE def = $1', [def]);
}

const getPermissionById = (p_id) => {
	return pool.query('SELECT * FROM \"permission\" WHERE id = $1', [p_id]);
}

const getPermissionByName = (p_name) => {
	return pool.query('SELECT * FROM \"permission\" WHERE name = $1', [p_name]);
}
const getPermissionsOfUser = (u_id) => {
	return pool.query('SELECT * FROM \"user-permission\" WHERE user_id = $1', [u_id]);
}

const getPermissionsOfUsergroup = async (g_id) => {
	return pool.query('SELECT * FROM \"usergroup-permission\" WHERE group_id = $1', [g_id]);
}

module.exports = {
	getUsers,
	getUserById,
	getUserNameById,
	getUserByEmail,
	getUsersById,
	getBloggroups,
	getBloggroupById,
	getBloggroupByName,
	getUsergroups,
	getUsergroups_def,
	getUsergroupById,
	getBlogById,
	getBlogs,
	getBlogsOffsetBy,
	getBlogsSubset,
	getBlogsByAuthorId,
	getBlogsByGroupId,
	getBlogsByGroupIdAfterTime,
	getBlogsByGroupIdOffsetBy,
	getTickets,
	getTicketsForUser,
	getTicketById,
	getPermissions,
	getPermissions_def,
	getPermissionById,
	getPermissionByName,
	getUsergroupsOfUser,
	getPermissionsOfUser,
	getPermissionsOfUsergroup
}
