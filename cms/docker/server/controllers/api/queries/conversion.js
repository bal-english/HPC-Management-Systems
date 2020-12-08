const Pool = require('pg').Pool;
const pool = new Pool();

const user = {
  idToEmail: (u_id) => {
    const user_id = parseInt(u_id);
    return pool.query('SELECT email FROM \"user\" WHERE id = $1', [u_id]);
  },
  emailToId: (email) => {
    return pool.query('SELECT id FROM \"user\" WHERE email = $1', [email]);
  }
}

const bloggroup = {
  idToName: (g_id) => {
    const group_id = parseInt(g_id);
    return pool.query('SELECT \"name\" FROM \"bloggroup\" WHERE id = $1', [group_id]);
  },
  nameToId: (name) => {
    return pool.query('SELECT \"id\" FROM \"bloggroup\" WHERE name = $1', [name]);
  }
}

module.exports = {
  user,
  bloggroup
}
