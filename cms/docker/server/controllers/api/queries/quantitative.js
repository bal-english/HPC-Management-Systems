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

// TODO: getCountOfBlogsByVisibility(bool)

const getCountOfTicketsAssignedToUserByUserId = (u_id) => {
	const user_id = parseInt(u_id)
	return pool.query('SELECT count(*) FROM (SELECT * FROM \"ticket-user_assignee\" WHERE user_id = $1) AS \"table\"', [user_id])
}

const getCountOfQueuedTicketsAssignedToUserByUserId = (u_id) => {
	const user_id = parseInt(u_id)
	console.log("hello")
	return pool.query('SELECT * FROM \"ticket-user_assignee\" WHERE user_id = $1', [user_id]).then(results => results.rows).then(vals => {
		arr = []
		vals.forEach(val => {
			arr.push(val.ticket_id);
		})
		return arr;
	}).then(async ticket_ids => {
		console.log(ticket_ids.length)
		if(ticket_ids.length == 0) {
			return " WHERE id = -1";
		} else {
			console.log("test");
			str = "WHERE (";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR";
			})
			str = await str.substring(0, str.length - 3) + ")"
			console.log(str);
			console.log('SELECT * FROM \"ticket\" ' + str)
			return str;
		}
	}).then(str => {
		console.log('SELECT count(*) FROM (SELECT * FROM \"ticket\" ' + str + ' AND status = \'Assigned\') AS \"table\"')
		return pool.query('SELECT count(*) FROM (SELECT * FROM \"ticket\" ' + str + ' AND status = \'Assigned\') AS \"table\"')
	});
}

const getCountOfInProgressTicketsAssignedToUserByUserId = (u_id) => {
	const user_id = parseInt(u_id)
	return pool.query('SELECT * FROM \"ticket-user_assignee\" WHERE user_id = $1', [user_id]).then(results => results.rows).then(vals => {
		arr = []
		vals.forEach(val => {
			arr.push(val.ticket_id);
		})
		return arr;
	}).then(async ticket_ids => {
		console.log(ticket_ids.length)
		if(ticket_ids.length == 0) {
			return " WHERE id = -1";
		} else {
			console.log("test");
			str = "WHERE (";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR";
			})
			str = await str.substring(0, str.length - 3) + ")"
			console.log(str);
			console.log('SELECT * FROM \"ticket\" ' + str)
			return str;
		}
	}).then(str => pool.query('SELECT count(*) FROM (SELECT * FROM \"ticket\" ' + str + ' AND status = \'Working\') AS \"table\"'))
}

const getCountOfTicketsAssignedToGroupByGroupId = (g_id) => {
	const group_id = parseInt(g_id)
	return pool.query('SELECT count(*) FROM (SELECT * FROM \"ticket-group_assignee\" WHERE group_id = $1) AS \"table\"', [group_id])
}

const getCountOfQueuedTicketsAssignedToGroupByGroupId = (g_id) => {
	const group_id = parseInt(g_id)
	return pool.query('SELECT * FROM \"ticket-group_assignee\" WHERE group_id = $1', [group_id]).then(results => results.rows).then(vals => {
		arr = []
		vals.forEach(val => {
			arr.push(val.ticket_id);
		})
		return arr;
	}).then(async ticket_ids => {
		console.log(ticket_ids.length)
		if(ticket_ids.length == 0) {
			return " WHERE id = -1";
		} else {
			console.log("test");
			str = "WHERE (";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR";
			})
			str = await str.substring(0, str.length - 3) + ")"
			console.log(str);
			console.log('SELECT * FROM \"ticket\" ' + str)
			return str;
		}
	}).then(str => pool.query('SELECT count(*) FROM (SELECT * FROM \"ticket\" ' + str + ' AND status = \'Assigned\') AS \"table\"'))
}

const getCountOfInProgressTicketsAssignedToGroupByGroupId = (g_id) => {
	const group_id = parseInt(g_id)
	return pool.query('SELECT * FROM \"ticket-group_assignee\" WHERE group_id = $1', [group_id]).then(results => results.rows).then(vals => {
		arr = []
		vals.forEach(val => {
			arr.push(val.ticket_id);
		})
		return arr;
	}).then(async ticket_ids => {
		console.log(ticket_ids.length)
		if(ticket_ids.length == 0) {
			return " WHERE id = -1";
		} else {
			console.log("test");
			str = "WHERE (";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR";
			})
			str = await str.substring(0, str.length - 3) + ")"
			console.log(str);
			console.log('SELECT * FROM \"ticket\" ' + str)
			return str;
		}
	}).then(str => pool.query('SELECT count(*) FROM (SELECT * FROM \"ticket\" ' + str + ' AND status = \'Working\') AS \"table\"'))
}

const getCountOfUnassignedTickets = () => {
	return pool.query('SELECT count(*) FROM (SELECT * FROM \"ticket\" WHERE status = \'Queued\') AS \"table\"');
}

const getCountOfUsersAssignedToTicket = (t_id) => {
	const ticket_id = parseInt(t_id);
	return pool.query('SELECT count(*) FROM (SELECT * FROM \"ticket-user_assignee\" WHERE ticket_id=$1) AS \"table\"', [ticket_id]);
}
module.exports = {
	getUserCount,
	getTicketCount,
	getTicketCountOfUser,
	getCountOfBlogs,
	getBlogCountByUser,
	getCountOfBlogsByGroupId,
	getCountOfBlogsOffsetBy,
	getCountOfBlogsByGroupIdOffsetBy,
	getCountOfTicketsAssignedToUserByUserId,
	getCountOfQueuedTicketsAssignedToUserByUserId,
	getCountOfInProgressTicketsAssignedToUserByUserId,
	getCountOfTicketsAssignedToGroupByGroupId,
	getCountOfQueuedTicketsAssignedToGroupByGroupId,
	getCountOfInProgressTicketsAssignedToGroupByGroupId,
	getCountOfUnassignedTickets,
	getCountOfUsersAssignedToTicket
}
