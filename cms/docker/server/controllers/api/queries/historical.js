const Pool = require('pg').Pool;
const pool = new Pool();

const objective = require('./objective');

const userAuthoredBlogs = (user_id) => {
  const u_id = parseInt(user_id)  // TODO: Add error handling
  return objective.getBlogsByAuthorId(user_id).then(results => results.rowCount > 0);
}

const userAuthoredTickets = (user_id) => {
  const u_id = parseInt(user_id)  // TODO: Add error handling
  return objective.getTicketsForUser(user_id).then(results => results.rowCount > 0);
}

module.exports = {
  userAuthoredBlogs,
  userAuthoredTickets
}
