const Pool = require('pg').Pool;
const pool = new Pool();

const addUserToGroup = (u_id, g_id) => {
  const user_id = parseInt(u_id);
  const group_id = parseInt(g_id);
  return pool.query('INSERT INTO \"user-usergroup\" (\"user_id\", \"group_id\") VALUES ($1, $2)', [user_id, group_id]);
}

const removeUserFromGroup = (u_id, g_id) => {
  const user_id = parseInt(u_id);
  const group_id = parseInt(g_id);
  return pool.query('DELETE FROM \"user-usergroup\" WHERE user_id=$1 AND group_id=$2', [user_id, group_id]);
}

const givePermToUser = (u_id, p_id) => {
  const user_id = parseInt(u_id);
  const perm_id = parseInt(p_id);
  return pool.query('INSERT INTO \"user-permission\" (\"user_id\", \"perm_id\") VALUES ($1, $2)', [user_id, perm_id]);
}

const removePermFromUser = (u_id, p_id) => {
  const user_id = parseInt(u_id);
  const perm_id = parseInt(p_id);
  return pool.query('DELETE FROM \"user-permission\" WHERE user_id=$1 AND perm_id=$2', [user_id, perm_id]);
}

const givePermToUsergroup = (g_id, p_id) => {
  const group_id = parseInt(g_id);
  const perm_id = parseInt(p_id);
  return pool.query('INSERT INTO \"usergroup-permission\" (\"group_id\", \"perm_id\") VALUES ($1, $2)', [group_id, perm_id]);
}

const removePermFromUsergroup = (g_id, p_id) => {
  const group_id = parseInt(g_id);
  const perm_id = parseInt(p_id);
  return pool.query('DELETE FROM \"usergroup-permission\" WHERE group_id=$1 AND perm_id=$2', [group_id, perm_id]);
}

const assignTicketToUser = (u_id, t_id) => {
  const user_id = parseInt(u_id);
  const ticket_id = parseInt(t_id);
  return pool.query('INSERT INTO \"ticket-user_assignee\" (\"user_id\", \"ticket_id\") VALUES ($1, $2) RETURNING \"ticket_id\"', [user_id, ticket_id]);
}

const assignTicketToGroup = (u_id, t_id) => {
  const group_id = parseInt(g_id);
  const ticket_id = parseInt(t_id);
  return pool.query('INSERT INTO \"ticket-group_assignee\" (\"group_id\", \"ticket_id\") VALUES ($1, $2) RETURNING \"ticket_id\"', [group_id, ticket_id]);
}

module.exports = {
  addUserToGroup,
  removeUserFromGroup,
  givePermToUser,
  removePermFromUser,
  givePermToUsergroup,
  removePermFromUsergroup,
  assignTicketToUser,
  assignTicketToGroup
}
