
var express = require('express');
var router = express.Router();

const objective = require('./queries/objective');
const existential = require('./queries/existential');
const quantitative = require('./queries/quantitative');
const permissive = require('./queries/permissive');
const creation = require('./queries/creation');
const connection = require('./queries/connection');
const historical = require('./queries/historical');
const update = require('./queries/update');
const conversion = require('./queries/conversion');

var db = {
	'datareq': objective,
	'exis': existential,
	'quan': quantitative,
	'perm': permissive,
	'create': creation,
	'connect': connection,
	'update': update,
	'hist': historical,
	'convert': conversion
};

router.get('/', (req, res) => {
	res.json({info: 'Node.js, Express, and Postgres API' });
})

router.get('/count/users/', (req, res) => {
	db.quan.getUserCount().then(results => res.status(200).json(results.rows[0]));
});

router.get('/count/tickets/user/:id', (req, res) => {
	const user_id = parseInt(req.params.id);				// TODO: add error catching on parse
	db.quan.getTicketCountOfUser(user_id).then(results => res.status(200).json(results.rows[0]));
});

router.get('/count/blogs/:gid([0-9]+)/:offset([0-9]+)', (req, res) => {
	const offset = parseInt(req.params.offset);
	const group_id = parseInt(req.params.gid);
	db.quan.getCountOfBlogsByGroupIdOffsetBy(group_id, offset).then(results => res.status(200).json(results.rows[0]));
});


// TODO: Fix
router.get('/exists/email/:email', (req, res) => {
	const email = req.params.email;							// TODO: add format (regex) checking
	db.exis.checkUserExistsByEmail(email).then(results => {
		if(results.rowCount == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rowCount == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).send({"found": true, "value": results.rows});
		}
	});
});

router.get('/rel/u:user([0-9]+)/g:group([0-9]+)', (req, res) => {
	const u_id = parseInt(req.params.user);
	const g_id = parseInt(req.params.group);

	db.exis.userInGroup(u_id, g_id).then(results => {
		if(results.rows.length == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rows.length == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).json({"found": true, "value": results.rows});
		}
	});
});

router.get('/rel/u:user([0-9]+)/p:perm([0-9]+)', (req, res) => {
	const u_id = parseInt(req.params.user);
	const p_id = parseInt(req.params.perm);

	db.exis.userHasPerm(u_id, p_id).then(results => {
		if(results.rows.length == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rows.length == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).json({"found": true, "value": results.rows});
		}
	});
});

router.get('/rel/g:group([0-9]+)/p:perm([0-9]+)', (req, res) => {
	const g_id = parseInt(req.params.group);
	const p_id = parseInt(req.params.perm);

	db.exis.usergroupHasPerm(g_id, p_id).then(results => {
		if(results.rows.length == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rows.length == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).json({"found": true, "value": results.rows});
		}
	});
});

router.get('/rel/u:user([0-9]+)/t:ticket([0-9]+)', (req, res) => {
	const u_id = parseInt(req.params.user);
	const t_id = parseInt(req.params.ticket);

	db.exis.userIsAssignedTicket(u_id, t_id).then(results => {
		if(results.rows.length == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rows.length == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).json({"found": true, "value": results.rows});
		}
	});
});

router.get('/rel/g:group([0-9]+)/t:ticket([0-9]+)', (req, res) => {
	const g_id = parseInt(req.params.group);
	const t_id = parseInt(req.params.ticket);

	db.exis.groupIsAssignedTicket(g_id, t_id).then(results => {
		if(results.rows.length == 0) {
			res.status(404).json({"found": false, "value": results.rows});
		} else if(results.rows.length == 1) {
			res.status(200).json({"found": true, "value": results.rows[0]})
		} else {
			res.status(409).json({"found": true, "value": results.rows});
		}
	});
});

router.get('/users', (req, res) => {
	db.datareq.getUsers().then(results => res.status(200).json(results.rows));
});
router.get('/user/:id([0-9]+)', (req, res) => {
	const user_id = parseInt(req.params.id);
	db.datareq.getUserById(user_id).then(results => res.status(200).json(results.rows[0]));
});
router.get('/users/:min([0-9]+)/:max([0-9]+)', (req, res) => {
	const min = parseInt(req.params.min);
	const max = parseInt(req.params.max);
	db.datareq.getUsersById(min, max).then(results => res.status(200).json(results.rows));
});
router.get('/users/l:min([0-9]+)u:max([0-9]+)', (req, res) => {
	const min = parseInt(req.params.min);
	const max = parseInt(req.params.max);
	db.datareq.getUsersById(min, max).then(results => res.status(200).json(results.rows));
});

//router.post('/users', db.createUser)
//router.put('/users/:id([0-9]+)', db.updateUser)
//router.delete('/users/:id([0-9]+)', db.deleteUser)

router.get('/groups/user', (req, res) => {
	if(req.query.def == 'true' || req.query.def == 'True' || req.query.def == "TRUE") {
		db.datareq.getUsergroups_def(true).then(results => res.status(200).json(results.rows));
	} else if(req.query.def == 'false' || req.query.def == 'False' || req.query.def == "FALSE") {
		db.datareq.getUsergroups_def(false).then(results => res.status(200).json(results.rows));
	} else {
		db.datareq.getUsergroups().then(results => res.status(200).json(results.rows));
	}
});

router.get('/group/user/:id([0-9]+)', (req, res) => {
	const id = parseInt(req.params.id);
	db.datareq.getUsergroupById(id).then(results => res.status(200).json(results.rows[0]));
});
//router.post('/groups/user', db.createUsergroup)
//router.put('/groups/user', db.updateUsergroup)

router.get('/groups/blog', (req, res) => {
	db.datareq.getBloggroups().then(results => res.status(200).json(results.rows));
});

router.get('/group/blog/:id([0-9]+)', (req, res) => {
	const id = parseInt(req.params.id);
	db.datareq.getBloggroupById(id).then(results =>	res.status(200).json(results.rows[0]));
});

router.get('/group/blog/:name([A-Za-z0-9]{0,}[A-Za-z]+[A-Za-z0-9]{0,})', (req, res) => {
	const name = req.params.name;
	db.datareq.getBloggroupByName(name).then(results => res.status(200).json(results.rows[0]));
});

//router.post('/groups/blog', db.createBloggroup)
//router.put('/groups/blog', db.updateBloggroup)

router.get('/blogs', (req, res) => {
	db.datareq.getBlogs().then(results => res.status(200).json(results.rows));
});

router.get('/blog/:id([0-9]+)', (req, res) => {
	const blog_id = parseInt(req.params.id);
	db.datareq.getBlogById(blog_id).then(results =>	res.status(200).json(results.rows[0]));
});

router.get('/blogs/by:id([0-9]+)', (req, res) => {
	const auth_id = parseInt(req.params.id);
	db.datareq.getBlogsByAuthorId(auth_id).then(results => res.status(200).json(results.rows));
});

//router.get('/blogs/:after([0-9]+)', db.getBlogsAfterBlogId)

router.get('/blogs/group/:id', (req, res) => {
	const group_id = parseInt(req.params.id);
	db.datareq.getBlogsByGroupId(group_id).then(results => res.status(200).json(results.rows));
});

router.get('/blogs/:gid([0-9]+)/:date([0-9]{4}-[0-9]{2}-[0-9]{2})/:time([0-9]{2}[:][0-9]{2}[:][0-9]{2})', (req, res) => {
	const ts = req.params.date + " " + req.params.time;
	const group_id = parseInt(req.params.gid);
	db.datareq.getBlogsByGroupIdAfterTime(group_id, ts).then(results => res.status(200).json(results.rows));
});

router.get('/blogs/:gid([0-9]+)/:offset([0-9]+)', (req, res) => {
	const offset = parseInt(req.params.offset);
	const group_id = parseInt(req.params.gid);
	db.datareq.getBlogsByGroupIdOffsetBy(group_id, offset).then(results => res.status(200).json(results.rows));
});

//router.post('/blogs', db.createBlog)

//router.put('/blogs/group', db.groupBlog)

//router.post('/ticket', db.createTicket)

router.get('/tickets', (req, res) => {
	db.datareq.getTickets().then(results => res.status(200).json(results.rows));
});

router.get('/tickets/user/:id([0-9]+)', (req, res) => {
	const user_id = parseInt(req.params.id);
	db.datareq.getTicketsForUser(user_id).then(results => res.status(200).json(results.rows));
});

router.get('/ticket/:id([0-9]+)', (req, res) => {
	const user_id = parseInt(req.params.id);
	db.datareq.getTicketById(user_id).then(results => res.status(200).json(results.rows[0]));
});

router.get('/permissions', (req, res) => {
	if(req.query.def == 'true' || req.query.def == 'True' || req.query.def == "TRUE") {
		db.datareq.getPermissions_def(true).then(results => res.status(200).json(results.rows))
	} else if(req.query.def == 'false' || req.query.def == 'False' || req.query.def == "FALSE") {
		db.datareq.getPermissions_def(false).then(results => res.status(200).json(results.rows))
	} else {
		db.datareq.getPermissions().then(results => res.status(200).json(results.rows));
	}
});

router.get('/permission/:id([0-9]+)', (req, res) => {
	const perm_id = parseInt(req.params.id);
	db.datareq.getPermissionById(perm_id).then(results => res.status(200).json(results.rows));
});

router.get('/groupsof/:id([0-9]+)', async (req, res) => {
	const user_id = parseInt(req.params.id);
	db.datareq.getUsergroupsOfUser(user_id).then(results => res.status(200).json(results.rows))
})

router.get('/permset/user/:id([0-9]+)', async (req, res) => {
	const user_id = parseInt(req.params.id);
	db.perm.getUserPermSet(user_id, req.query.full).then(permset => res.status(200).json(Array.from(permset)));
});

router.get('/permset/group/:id([0-9]+)', (req, res) => {
	const group_id = parseInt(req.params.id);
	db.perm.getGroupPermSet(group_id).then(results => addperms(new Set(), results.rows)).then(permset => res.status(200).json(Array.from(permset)));
})


//router.patch('/permission/:id/:name', db.updatePermission)

//router.post('/permission/:name', db.createPermission)

module.exports = {
	router,
	db
}
