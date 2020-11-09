const Pool = require('pg').Pool;
const pool = new Pool();

const checkUserExistsByEmail = (req, res) => {
	const email = req.params.email;
	//const email = req.params.local + "@" + req.params.domain;
	//console.log(email);
	pool.query('SELECT * FROM \"user\" WHERE email=$1', [email], (error, results) => {
		if(error) {
			throw error;
		}
		if(results.rows.length == 0) {
			res.status(404).json(results.rows);
		} else if(results.rows.length == 1) {
			res.status(200).json(results.rows[0])
		} else {
			res.status(409).send('Multiple users found with that email');
		}
	});
}

const userInGroup = (req, res) => {
	const u_id = parseInt(req.params.user);
	const g_id = parseInt(req.params.group);
	
	pool.query('SELECT * FROM \"user-usergroup\" WHERE user_id=$1 AND group_id=$2', [u_id, g_id], (error, results) => {
		if(error) {
			throw error;
		}
		if(results.rows.length == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rows.length == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).json({"found": true, "value": results.rows});
		}
	});
}

const userHasPerm = (req, res) => {
	const u_id = parseInt(req.params.user);
	const p_id = parseInt(req.params.perm);
	
	pool.query('SELECT * FROM \"user-permission\" WHERE user_id=$1 AND perm_id=$2', [u_id, p_id], (error, results) => {
		if(error) {
			throw error;
		}
		if(results.rows.length == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rows.length == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).json({"found": true, "value": results.rows});
		}
	});
}

const usergroupHasPerm = (req, res) => {
	const g_id = parseInt(req.params.group);
	const p_id = parseInt(req.params.perm);
	
	pool.query('SELECT * FROM \"usergroup-permission\" WHERE group_id=$1 AND perm_id=$2', [g_id, p_id], (error, results) => {
		if(error) {
			throw error;
		}
		if(results.rows.length == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rows.length == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).json({"found": true, "value": results.rows});
		}
	});
}

const userIsAssignedTicket = (req, res) => {
	const t_id = parseInt(req.params.ticket);
	const u_id = parseInt(req.params.user);
	
	pool.query('SELECT * FROM \"ticket-user_assignee\" WHERE ticket_id=$1 AND user_id=$2', [t_id, u_id], (error, results) => {
		if(error) {
			throw error;
		}
		if(results.rows.length == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rows.length == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).json({"found": true, "value": results.rows});
		}
	});
}

const groupIsAssignedTicket = (req, res) => {
	const t_id = parseInt(req.params.ticket);
	const g_id = parseInt(req.params.group);
	
	pool.query('SELECT * FROM \"ticket-group_assignee\" WHERE ticket_id=$1 AND group_id=$2', [t_id, g_id], (error, results) => {
		if(error) {
			throw error;
		}
		if(results.rows.length == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rows.length == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).json({"found": true, "value": results.rows});
		}
	});
}

module.exports = {
	checkUserExistsByEmail,
	userInGroup,
	userHasPerm,
	usergroupHasPerm,
	userIsAssignedTicket,
	groupIsAssignedTicket
}