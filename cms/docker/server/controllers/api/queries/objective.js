const Pool = require('pg').Pool;
const pool = new Pool();

const getUsers = () => {
	return pool.query('SELECT * FROM \"user\"', []);
}

const getUserById = (id) => {
	const u_id = parseInt(id);
	return pool.query('SELECT * FROM \"user\" WHERE id = $1', [u_id]);
}

const getUserInfoById = (id) => {
	const u_id = parseInt(id);
	return pool.query('SELECT \"id\", \"lastName\", \"firstName\", \"email\", \"deactivated\", \"joined\" FROM \"user\" WHERE id = $1', [u_id]);
}

const getUserByEmail = (email) => {
	return pool.query('SELECT * FROM \"user\" WHERE email=$1', [email]);
}

const getUserInfoByEmail = (email) => {
	return pool.query('SELECT \"id\", \"lastName\", \"firstName\", \"email\", \"deactivated\" FROM \"user\" WHERE email=$1', [email]);
}

const getUserNonce = (u_id) => {
	return pool.query('SELECT')
}

const getUserNameById = (u_id) => {
	return pool.query('SELECT \"firstName\", \"lastName\" FROM \"user\" WHERE id = $1' [u_id]);
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

const getUsergroupById = (u_id) => {
	return pool.query('SELECT * FROM \"usergroup\" WHERE id = $1', [u_id]);
}

const getUsergroups_def = (def) => {
	return pool.query('SELECT * FROM \"usergroup\" WHERE def = $1', [def]);
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

const getBlogsSubsetByUserId = (user_id, offset, limit) => {
	return pool.query('SELECT * FROM \"blog\" WHERE id=$3 ORDER BY \"posttime\" DESC OFFSET $1 LIMIT $2', [offset, limit, user_id])
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
	const user_id = parseInt(u_id);
	return pool.query('SELECT * FROM \"ticket\" WHERE creator = $1', [user_id]);
}

const getTicketsSubset = (offset, limit) => {
	//return pool.query('SELECT * FROM \"ticket\" ORDER BY \"posttime\" DESC OFFSET $1 LIMIT $2', [offset, limit])
	return pool.query('SELECT * FROM \"ticket\" OFFSET $1 LIMIT $2', [offset, limit])
}

const getTicketsSubsetByUserId = (u_id, offset, limit) => {
	const user_id = parseInt(u_id);
	//return pool.query('SELECT * FROM \"ticket\" WHERE id=$3 ORDER BY \"posttime\" DESC OFFSET $1 LIMIT $2', [offset, limit, user_id])
	return pool.query('SELECT * FROM \"ticket\" WHERE creator=$3 OFFSET $1 LIMIT $2', [offset, limit, user_id])
}

const getTicketById = (u_id) => {
	const user_id = parseInt(u_id);
	return pool.query('SELECT * FROM \"ticket\" WHERE id = $1', [user_id]);
}

const getCreatorOfTicket = (t_id) => {
	const ticket_id = parseInt(t_id);
	return pool.query('SELECT \"creator\" FROM \"ticket\" WHERE id = $1', [ticket_id]);
}

const getTicketsAssignedToUserByUserId = (u_id) => {
	const user_id = parseInt(u_id)

	return pool.query('SELECT \"ticket_id\" FROM \"ticket-user_assignee\" WHERE user_id = $1', [user_id]).then(results => results.rows).then(vals => {
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
			str = "WHERE";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR";
			})
			str = await str.substring(0, str.length - 3)
			console.log(str);
			console.log('SELECT * FROM \"ticket\" ' + str)
			return str;
		}
	}).then(str => pool.query('SELECT * FROM \"ticket\" ' + str))
}

const getTicketsAssignedToUserSubsetByUserId = (u_id, offset, limit) => {
	const user_id = parseInt(u_id)
	offset = parseInt(offset);
	limit = parseInt(limit);

	return pool.query('SELECT \"ticket_id\" FROM \"ticket-user_assignee\" WHERE user_id = $1', [user_id]).then(results => results.rows).then(vals => {
		arr = []
		vals.forEach(val => {
			arr.push(val.ticket_id);
		})
		return arr;
	}).then(ticket_ids => {
		if(ticket_ids.length == 0) {
			return " WHERE id = -1";
		} else {
			str = "WHERE";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR"
			})
			str = str.substring(0, str.length - 3) + " OFFSET " + offset + " LIMIT " + limit;
			return str;
		}
	}).then(str => pool.query('SELECT * FROM \"ticket\" ' + str))
}

const getQueuedTicketsAssignedToUserByUserId = (u_id) => {
	const user_id = parseInt(u_id)

	return pool.query('SELECT \"ticket_id\" FROM \"ticket-user_assignee\" WHERE user_id = $1', [user_id]).then(results => results.rows).then(vals => {
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
			str = "WHERE ()";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR";
			})
			str = await str.substring(0, str.length - 3) + ")"
			console.log(str);
			console.log('SELECT * FROM \"ticket\" ' + str)
			return str;
		}
	}).then(str => pool.query('SELECT * FROM \"ticket\" ' + str + ' AND status = \'Assigned\''))
}

const getQueuedTicketsAssignedToUserSubsetByUserId = (u_id, offset, limit) => {
	const user_id = parseInt(u_id)
	offset = parseInt(offset);
	limit = parseInt(limit);

	return pool.query('SELECT \"ticket_id\" FROM \"ticket-user_assignee\" WHERE user_id = $1', [user_id]).then(results => results.rows).then(vals => {
		arr = []
		vals.forEach(val => {
			arr.push(val.ticket_id);
		})
		return arr;
	}).then(ticket_ids => {
		if(ticket_ids.length == 0) {
			return " WHERE id = -1";
		} else {
			str = "WHERE (";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR"
			})
			str = str.substring(0, str.length - 3) + ")"// + " OFFSET " + offset + " LIMIT " + limit;
			return str;
		}
	}).then(str => pool.query('SELECT * FROM \"ticket\" ' + str + ' AND status = \'Assigned\' OFFSET ' + offset + ' LIMIT ' + limit))
}

const getInProgressTicketsAssignedToUserSubsetByUserId = (u_id, offset, limit) => {
	const user_id = parseInt(u_id)
	offset = parseInt(offset);
	limit = parseInt(limit);

	return pool.query('SELECT \"ticket_id\" FROM \"ticket-user_assignee\" WHERE user_id = $1', [user_id]).then(results => results.rows).then(vals => {
		arr = []
		vals.forEach(val => {
			arr.push(val.ticket_id);
		})
		return arr;
	}).then(ticket_ids => {
		if(ticket_ids.length == 0) {
			return " WHERE id = -1";
		} else {
			str = "WHERE (";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR"
			})
			str = str.substring(0, str.length - 3) + ")"// + " OFFSET " + offset + " LIMIT " + limit;
			return str;
		}
	}).then(str => pool.query('SELECT * FROM \"ticket\" ' + str + ' AND status = \'Working\' OFFSET ' + offset + ' LIMIT ' + limit))
}
/*
const getQueuedTicketsAssignedToGroupByGroupId = (g_id) => {
	const group_id = parseInt(g_id)

	return pool.query('SELECT \"ticket_id\" FROM \"ticket-group_assignee\" WHERE group_id = $1', [group_id]).then(results => results.rows).then(vals => {
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
			str = "WHERE ()";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR";
			})
			str = await str.substring(0, str.length - 3) + ")"
			console.log(str);
			console.log('SELECT * FROM \"ticket\" ' + str)
			return str;
		}
	}).then(str => pool.query('SELECT * FROM \"ticket\" ' + str + ' AND status = \'Assigned\''))
}

const getQueuedTicketsAssignedToGroupSubsetByGroupId = (g_id, offset, limit) => {
	const group_id = parseInt(g_id)
	offset = parseInt(offset);
	limit = parseInt(limit);

	return pool.query('SELECT \"ticket_id\" FROM \"ticket-group_assignee\" WHERE group_id = $1', [group_id]).then(results => results.rows).then(vals => {
		arr = []
		vals.forEach(val => {
			arr.push(val.ticket_id);
		})
		return arr;
	}).then(ticket_ids => {
		if(ticket_ids.length == 0) {
			return " WHERE id = -1";
		} else {
			str = "WHERE (";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR"
			})
			str = str.substring(0, str.length - 3) + ")"// + " OFFSET " + offset + " LIMIT " + limit;
			return str;
		}
	}).then(str => pool.query('SELECT * FROM \"ticket\" ' + str + ' AND status = \'Assigned\' OFFSET ' + offset + ' LIMIT ' + limit))
}

const getInProgressTicketsAssignedToGroupSubsetByGroupId = (g_id, offset, limit) => {
	const group_id = parseInt(g_id)
	offset = parseInt(offset);
	limit = parseInt(limit);

	return pool.query('SELECT \"ticket_id\" FROM \"ticket-group_assignee\" WHERE group_id = $1', [group_id]).then(results => results.rows).then(vals => {
		arr = []
		vals.forEach(val => {
			arr.push(val.ticket_id);
		})
		return arr;
	}).then(ticket_ids => {
		if(ticket_ids.length == 0) {
			return " WHERE id = -1";
		} else {
			str = "WHERE (";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR"
			})
			str = str.substring(0, str.length - 3) + ")"// + " OFFSET " + offset + " LIMIT " + limit;
			return str;
		}
	}).then(str => pool.query('SELECT * FROM \"ticket\" ' + str + ' AND status = \'Working\' OFFSET ' + offset + ' LIMIT ' + limit))
}

const getQueuedTicketsAssignedToGroupsSubsetByGroupIds = (g_ids, offset, limit) => {
	if(!Array.isArray(g_ids)) {
		throw "Supplied Variable is not an array."
	}
	for(i = 0; i < g_ids; i++) {
		g_ids[i] = parseInt(g_ids[i]);
	}
	const group_ids = g_ids
	offset = parseInt(offset);
	limit = parseInt(limit);

	return pool.query('SELECT \"ticket_id\" FROM \"ticket-group_assignee\" WHERE group_id = $1', [group_id]).then(results => results.rows).then(vals => {
		arr = []
		vals.forEach(val => {
			arr.push(val.ticket_id);
		})
		return arr;
	}).then(ticket_ids => {
		if(ticket_ids.length == 0) {
			return " WHERE id = -1";
		} else {
			str = "WHERE (";
			ticket_ids.forEach(id => {
				str += " id = " + id + " OR"
			})
			str = str.substring(0, str.length - 3) + ")"// + " OFFSET " + offset + " LIMIT " + limit;
			return str;
		}
	}).then(str => pool.query('SELECT * FROM \"ticket\" ' + str + ' AND status = \'Assigned\' OFFSET ' + offset + ' LIMIT ' + limit))
}
*/

const getUnassignedTicketsSubset = (offset, limit) => {
	offset = parseInt(offset);
	limit = parseInt(limit);
	console.log(offset)
	console.log(limit);
	return pool.query('SELECT * FROM \"ticket\" WHERE status = \'Queued\' OFFSET $1 LIMIT $2', [offset, limit]);
}

const getTicketRepliesByTicketId = (t_id) => {
	const ticket_id = parseInt(t_id);
	return pool.query('SELECT * FROM \"thread-reply\" WHERE parent = $1', [ticket_id]);
}

const getTicketRepliesSubsetByTicketId = (t_id, offset, limit) => {
	const ticket_id = parseInt(t_id);
	offset = parseInt(offset);
	limit = parseInt(limit);
	return pool.query('SELECT * FROM \"thread-reply\" WHERE parent = $1 OFFSET $2, LIMIT $3', [ticket_id, offset, limit]);
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

const getPermissionsOfUsergroup = (g_id) => {
	return pool.query('SELECT * FROM \"usergroup-permission\" WHERE group_id = $1', [g_id]);
}

const getAssignedByTicket = (t_id) => {
	const ticket_id = parseInt(t_id);
	return pool.query('SELECT * FROM \"ticket-user_assignee\" WHERE ticket_id = $1', [ticket_id]);
}

const getAssignedByUser = (u_id) => {
	const user_id = parseInt(u_id);
	return pool.query('SELECT * FROM \"ticket-user_assignee\" WHERE user_id = $1', [user_id]);
}

const getPossibleTicketStatuses = () => {
	return pool.query('SELECT enum_range(NULL::ticket_status)');
}

module.exports = {
	getUsers,
	getUserById,
	getUserNameById,
	getUserByEmail,
	getUsersById,
	getUserInfoById,
	getUserInfoByEmail,
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
	getBlogsSubsetByUserId,
	getBlogsByAuthorId,
	getBlogsByGroupId,
	getBlogsByGroupIdAfterTime,
	getBlogsByGroupIdOffsetBy,
	getTickets,
	getTicketsForUser,
	getTicketsSubset,
	getTicketsSubsetByUserId,
	getTicketById,
	getTicketsAssignedToUserByUserId,
	getTicketsAssignedToUserSubsetByUserId,
	getQueuedTicketsAssignedToUserByUserId,
	getQueuedTicketsAssignedToUserSubsetByUserId,
	getInProgressTicketsAssignedToUserSubsetByUserId,
	/*getQueuedTicketsAssignedToGroupByGroupId,
	getQueuedTicketsAssignedToGroupSubsetByGroupId,
	getInProgressTicketsAssignedToGroupSubsetByGroupId,*/
	getUnassignedTicketsSubset,
	getCreatorOfTicket,
	getTicketRepliesByTicketId,
	getTicketRepliesSubsetByTicketId,
	getPermissions,
	getPermissions_def,
	getPermissionById,
	getPermissionByName,
	getUsergroupsOfUser,
	getPermissionsOfUser,
	getPermissionsOfUsergroup,
	getAssignedByTicket,
	getAssignedByUser,
	getPossibleTicketStatuses
}
