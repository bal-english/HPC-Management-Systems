const Pool = require('pg').Pool;
const pool = new Pool();

const checkUserExistsByEmail = (email) => {
	return pool.query('SELECT * FROM \"user\" WHERE email=$1', [email]);
}

const checkUserExistsById = (id) => {
	const user_id = parseInt(id);
	return pool.query('SELECT CASE WHEN EXISTS (SELECT * FROM \"user\" WHERE id=$1) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;', [user_id]);
}

const checkUserDeactivatedById = (id) => {
	const user_id = parseInt(id);
	return pool.query('SELECT deactivated FROM \"user\" WHERE id=$1', [user_id]);
}

const checkUsergroupExistsById = (id) => {
	const group_id = parseInt(id);
	return pool.query('SELECT CASE WHEN EXISTS (SELECT * FROM \"usergroup\" WHERE id=$1) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;', [group_id])
}

const checkPermExistsById = (id) => {
	const perm_id = parseInt(id);
	return pool.query('SELECT CASE WHEN EXISTS (SELECT * FROM \"permission\" WHERE id=$1) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;', [perm_id])
}

const checkUserInGroup = (u_id, g_id) => {
		const user_id = parseInt(u_id);
		const group_id = parseInt(g_id)
		return pool.query('SELECT CASE WHEN EXISTS (SELECT * FROM \"user-usergroup\" WHERE user_id=$1 AND group_id=$2) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;', [user_id, group_id]);
}

const checkUserHasPerm = (u_id, p_id) => {
	const user_id = parseInt(u_id);
	const perm_id = parseInt(p_id)
	return pool.query('SELECT CASE WHEN EXISTS (SELECT * FROM \"user-permission\" WHERE user_id=$1 AND perm_id=$2) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;', [user_id, perm_id]);
}

const checkUsergroupHasPerm = (g_id, p_id) => {
	const group_id = parseInt(g_id);
	const perm_id = parseInt(p_id);
	return pool.query('SELECT CASE WHEN EXISTS (SELECT * FROM \"usergroup-permission\" WHERE group_id=$1 AND perm_id=$2) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;', [group_id, perm_id])
}

const userInGroup = (u_id, g_id) => {
	const user_id = parseInt(u_id);
	const group_id = parseInt(g_id);
	return pool.query('SELECT * FROM \"user-usergroup\" WHERE user_id=$1 AND group_id=$2', [user_id, group_id]);
}

const userHasPerm = (u_id, p_id) => {
	return pool.query('SELECT * FROM \"user-permission\" WHERE user_id=$1 AND perm_id=$2', [u_id, p_id]);
}

const usergroupHasPerm = (g_id, p_id) => {
	return pool.query('SELECT * FROM \"usergroup-permission\" WHERE group_id=$1 AND perm_id=$2', [g_id, p_id]);
}

const checkTicketExistsById = (t_id) => {
	const ticket_id = parseInt(t_id);
	return pool.query('SELECT CASE WHEN EXISTS (SELECT * FROM \"ticket\" WHERE id=$1) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;', [ticket_id]);
}

const userIsAssignedTicket = (u_id, t_id) => {
	const ticket_id = parseInt(t_id);
	const user_id = parseInt(u_id);
	return pool.query('SELECT CASE WHEN EXISTS (SELECT * FROM \"ticket-user_assignee\" WHERE ticket_id=$1 AND user_id=$2) THEN CAST(1 AS BIT) ELSE CAST (0 AS BIT) END', [ticket_id, user_id]);
}

const groupIsAssignedTicket = (g_id, t_id) => {
	return pool.query('SELECT * FROM \"ticket-group_assignee\" WHERE ticket_id=$1 AND group_id=$2', [t_id, g_id]);
}

module.exports = {
	checkUserExistsByEmail,
	checkUserExistsById,
	checkPermExistsById,
	checkUserHasPerm,
	checkUsergroupHasPerm,
	checkUserInGroup,
	checkUsergroupExistsById,
	userInGroup,
	userHasPerm,
	usergroupHasPerm,
	checkTicketExistsById,
	userIsAssignedTicket,
	groupIsAssignedTicket,
	checkUserDeactivatedById
}
