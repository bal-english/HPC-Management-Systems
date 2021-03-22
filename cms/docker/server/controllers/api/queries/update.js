const Pool = require('pg').Pool;
const pool = new Pool();

const makeNonce = () => {
	return parseInt(Math.floor(Math.random()*4294967296)-2147483648);
}

const user = {
  nonce: (u_id) => {
		const user_id = parseInt(u_id);
    const newnonce = parseInt(makeNonce());
    return pool.query('UPDATE \"user\" SET nonce=$1 WHERE id=$2', [newnonce, user_id]);
  },
	deactivate: (u_id) => {
		const user_id = parseInt(u_id);
    return pool.query('UPDATE \"user\" SET deactivated=\'1\' WHERE id=$1', [user_id]);
	},
	reactivate: (u_id) => {
		const user_id = parseInt(u_id);
    return pool.query('UPDATE \"user\" SET deactivated=\'0\' WHERE id=$1', [user_id]);
	}
}

const ticketStatus = (t_id, t_status) => {
	return pool.query('UPDATE \"ticket\" SET \"status\"=$2 WHERE id=$1 RETURNING \"id\"', [t_id, t_status]);
};

const ticketAssigned = (t_id, t_assign) => {
	return pool.query('UPDATE \"ticket-user_assignee\" SET \"user_id\"=$2 WHERE ticket_id=$1 RETURNING \"id\"', [t_id, t_assign]);
};

module.exports = {
  user,
  ticketStatus,
  ticketAssigned
};
