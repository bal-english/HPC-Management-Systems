
var express = require('express');
var router = express.Router();
const db = require('./queries/queries');
const db_exis = require('./queries/existential');
const db_quan = require('./queries/quantitative');

//const Pool = require('pg').Pool;
//const pool2 = Pool

router.get('/', (req, res) => {
	res.json({info: 'Node.js, Express, and Postgres API' });
})
/*
router.get('/rel/u:user([0-9]+)/g:group([0-9]+)', db_exis.userInGroup);
router.get('/rel/u:user([0-9]+)/p:perm([0-9]+)', db_exis.userHasPerm);
router.get('/rel/g:group([0-9]+)/p:perm([0-9]+)', db_exis.usergroupHasPerm);
router.get('/rel/u:user([0-9]+)/t:ticket([0-9]+)', db_exis.userIsAssignedTicket);
router.get('/rel/g:group([0-9]+)/t:ticket([0-9]+)', db_exis.groupIsAssignedTicket);

router.get('/user/email/:email', db_exis.checkUserExistsByEmail);	//:local/:domain'

router.get('/users', db.getUsers)
router.get('/users/:id([0-9]+)', db.getUserById)
router.get('/users/:min([0-9]+)/:max([0-9]+)', db.getUsersById)
router.get('/users/l:min([0-9]+)u:max([0-9]+)', db.getUsersById)
router.post('/users', db.createUser)
router.put('/users/:id([0-9]+)', db.updateUser)
router.delete('/users/:id([0-9]+)', db.deleteUser)

router.get('/groups/user', db.getUsergroups)
router.get('/groups/user/:id([0-9]+)', db.getUsergroupById)
router.post('/groups/user', db.createUsergroup)
router.put('/groups/user', db.updateUsergroup)

router.get('/groups/blog', db.getBloggroups)
router.get('/groups/blog/:id([0-9]+)', db.getBloggroupById)
router.get('/groups/blog/:name([A-Za-z0-9]{0,}[A-Za-z]+[A-Za-z0-9]{0,})', db.getBloggroupByName)
router.post('/groups/blog', db.createBloggroup)
router.put('/groups/blog', db.updateBloggroup)

router.get('/blog/:id([0-9]+)', db.getBlogById)
router.get('/blogs', db.getBlogs)
router.get('/blogs/by:id([0-9]+)', db.getBlogsByAuthorId)
router.get('/blogs/:after([0-9]+)', db.getBlogsAfterBlogId)
router.get('/blogs/:gid([0-9]+)/:date([0-9]{4}-[0-9]{2}-[0-9]{2})/:time([0-9]{2}[:][0-9]{2}[:][0-9]{2})', db.getBlogsByGroupIdAfterTime)
router.get('/blogs/:gid([0-9]+)/:offset([0-9]+)', db.getBlogsByGroupIdOffsetBy)
router.get('/count/blogs/:gid([0-9]+)/:offset([0-9]+)', db.getBlogsByGroupIdOffsetBy_COUNT)
router.post('/blogs', db.createBlog)

router.put('/blogs/group', db.groupBlog)

//grace's route
router.post('/ticket', db.createTicket)

router.get('/tickets', db.getTickets)
router.get('/tickets/user/:id([0-9]+)', db.getTicketsForUser)
router.get('/ticket/:id([0-9]+)', db.getTicketById)

router.get('/permission', db.getPermissions)
router.get('/permission/:id', db.getPermissionById)
router.patch('/permission/:id/:name', db.updatePermission)
router.post('/permission/:name', db.createPermission)
*/


router.get('/count/users/', (req, res) => {
	db_quan.getUserCount().then(results => res.status(200).json(results.rows[0]));
});

router.get('/count/tickets/user/:id', (req, res) => {
	const user_id = parseInt(req.params.id);				// TODO: add error catching on parse
	db_quan.getTicketCountOfUser(user_id).then(results => res.status(200).json(results.rows[0]));
});

// TODO: Fix
router.get('/exists/email/:email', (req, res) => {
	const email = req.params.email;							// TODO: add format (regex) checking
	db_exis.checkUserExistsByEmail(email).then(results => {
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

	db_exis.userInGroup(u_id, g_id).then(results => {
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

	db_exis.userHasPerm(u_id, p_id).then(results => {
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
	
	db_exis.usergroupHasPerm(g_id, p_id).then(results => {
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

	db_exis.userIsAssignedTicket(u_id, t_id).then(results => {
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

	db_exis.groupIsAssignedTicket(g_id, t_id).then(results => {
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
	db.getUsers().then(results => res.status(200).json(results.rows));
});
router.get('/user/:id([0-9]+)', (req, res) => {
	const user_id = parseInt(req.params.id);
	db.getUserById(user_id).then(results => res.status(200).json(results.rows[0]));
});
router.get('/users/:min([0-9]+)/:max([0-9]+)', (req, res) => {
	const min = parseInt(req.params.min);
	const max = parseInt(req.params.max);
	db.getUsersById(min, max).then(results => res.status(200).json(results.rows));
});
router.get('/users/l:min([0-9]+)u:max([0-9]+)', (req, res) => {
	const min = parseInt(req.params.min);
	const max = parseInt(req.params.max);
	db.getUsersById(min, max).then(results => res.status(200).json(results.rows));
});

//router.post('/users', db.createUser)
//router.put('/users/:id([0-9]+)', db.updateUser)
//router.delete('/users/:id([0-9]+)', db.deleteUser)

router.get('/groups/user', (req, res) => {
	db.getUsergroups().then(results => res.status(200).json(results.rows));
});
router.get('/group/user/:id([0-9]+)', (req, res) => {
	const id = parseInt(req.params.id);
	db.getUsergroupById(id).then(results => res.status(200).json(results.rows[0]));
});
//router.post('/groups/user', db.createUsergroup)
//router.put('/groups/user', db.updateUsergroup)

router.get('/groups/blog', (req, res) => {
	db.getBloggroups().then(results => res.status(200).json(results.rows));
});

router.get('/group/blog/:id([0-9]+)', (req, res) => {
	const id = parseInt(req.params.id);
	db.getBloggroupById(id).then(results =>	res.status(200).json(results.rows[0]));
});

router.get('/group/blog/:name([A-Za-z0-9]{0,}[A-Za-z]+[A-Za-z0-9]{0,})', (req, res) => {
	const name = req.params.name;
	db.getBloggroupByName(name).then(results => res.status(200).json(results.rows[0]));
});

//router.post('/groups/blog', db.createBloggroup)
//router.put('/groups/blog', db.updateBloggroup)

router.get('/blogs', (req, res) => {
	db.getBlogs().then(results => res.status(200).json(results.rows));
});

router.get('/blog/:id([0-9]+)', (req, res) => {
	const blog_id = parseInt(req.params.id);
	db.getBlogById(blog_id).then(results =>	res.status(200).json(results.rows[0]));
});

router.get('/blogs/by:id([0-9]+)', (req, res) => {
	const auth_id = parseInt(req.params.id);
	db.getBlogsByAuthorId(auth_id).then(results => res.status(200).json(results.rows));
});

//router.get('/blogs/:after([0-9]+)', db.getBlogsAfterBlogId)

router.get('/blogs/group/:id', (req, res) => {
	const group_id = parseInt(req.params.id);
	db.getBlogsByGroupId(group_id).then(results => res.status(200).json(results.rows));
});

router.get('/blogs/:gid([0-9]+)/:date([0-9]{4}-[0-9]{2}-[0-9]{2})/:time([0-9]{2}[:][0-9]{2}[:][0-9]{2})', (req, res) => {
	const ts = req.params.date + " " + req.params.time;
	const group_id = parseInt(req.params.gid);
	db.getBlogsByGroupIdAfterTime(group_id, ts).then(results => res.status(200).json(results.rows));
});

router.get('/blogs/:gid([0-9]+)/:offset([0-9]+)', (req, res) => {
	const offset = parseInt(req.params.offset);
	const group_id = parseInt(req.params.gid);
	db.getBlogsByGroupIdOffsetBy(group_id, offset).then(results => res.status(200).json(results.rows));
});

//router.get('/count/blogs/:gid([0-9]+)/:offset([0-9]+)', db.getBlogsByGroupIdOffsetBy_COUNT)

//router.post('/blogs', db.createBlog)

//router.put('/blogs/group', db.groupBlog)

//router.post('/ticket', db.createTicket)

router.get('/tickets', (req, res) => {
	db.getTickets().then(results => res.status(200).json(results.rows));
});

router.get('/tickets/user/:id([0-9]+)', (req, res) => {
	const user_id = parseInt(req.params.id);
	db.getTicketsForUser(user_id).then(results => res.status(200).json(results.rows));
});

router.get('/ticket/:id([0-9]+)', (req, res) => {
	const user_id = parseInt(req.params.id);
	db.getTicketById(user_id).then(results => res.status(200).json(results.rows[0]));
});

router.get('/permissions', (req, res) => {
	db.getPermissions().then(results => res.status(200).json(results.rows));
});

router.get('/permission/:id', (req, res) => {
	const perm_id = parseInt(req.params.id);
	db.getPermissionById(perm_id).then(results => res.status(200).json(results.rows));
});

//router.patch('/permission/:id/:name', db.updatePermission)

//router.post('/permission/:name', db.createPermission)

module.exports = {
	router
}
