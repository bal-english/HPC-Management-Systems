const Pool = require('pg').Pool;
const pool = new Pool();

const checkUserExistsByEmail = (email) => {
	return pool.query('SELECT * FROM \"user\" WHERE email=$1', [email]);
}

const userInGroup = (u_id, g_id) => {
	return pool.query('SELECT * FROM \"user-usergroup\" WHERE user_id=$1 AND group_id=$2', [u_id, g_id]);
}

const userHasPerm = (u_id, p_id) => {
	return pool.query('SELECT * FROM \"user-permission\" WHERE user_id=$1 AND perm_id=$2', [u_id, p_id]);
}

const usergroupHasPerm = (g_id, p_id) => {
	
	return pool.query('SELECT * FROM \"usergroup-permission\" WHERE group_id=$1 AND perm_id=$2', [g_id, p_id]);
}

const userIsAssignedTicket = (u_id, t_id) => {
	return pool.query('SELECT * FROM \"ticket-user_assignee\" WHERE ticket_id=$1 AND user_id=$2', [t_id, u_id]);
}

const groupIsAssignedTicket = (g_id, t_id) => {
	return pool.query('SELECT * FROM \"ticket-group_assignee\" WHERE ticket_id=$1 AND group_id=$2', [t_id, g_id]);
}

module.exports = {
	checkUserExistsByEmail,
	userInGroup,
	userHasPerm,
	usergroupHasPerm,
	userIsAssignedTicket,
	groupIsAssignedTicket
}