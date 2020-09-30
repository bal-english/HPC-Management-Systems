
var express = require('express');
var router = express.Router();
const db = require('./queries/queries');

//const Pool = require('pg').Pool;
//const pool2 = Pool

router.get('/', (req, res) => {
	res.json({info: 'Node.js, Express, and Postgres API' });
})

router.get('/users', db.getUsers)
router.get('/users/:id([0-9]+)', db.getUserById)
router.get('/users/:min([0-9]+)/:max([0-9]+)', db.getUsersById);
router.get('/users/l:min([0-9]+)u:max([0-9]+)', db.getUsersById);
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

router.get('/blogs', db.getBlogs)
router.post('/blogs', db.createBlog)

router.put('/blogs/group', db.groupBlog)

//grace's route
router.post('/ticket', db.createTicket)

router.get('/tickets', db.getTickets)
router.get('/ticket/:id', db.getTicketById)

router.get('/permission', db.getPermissions)
router.get('/permission/:id', db.getPermissionById)
router.patch('/permission/:id/:name', db.updatePermission)
router.post('/permission/:name', db.createPermission)

module.exports = {
	router
}
