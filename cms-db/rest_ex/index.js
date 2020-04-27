const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const db = require('./queries');

//const Pool = require('pg').Pool;
//const pool2 = Pool



app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

app.get('/', (req, res) => {
	res.json({info: 'Node.js, Express, and Postgres API' });
})

app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)

app.post('/groups/user', db.createUsergroup)
app.put('/groups/user', db.updateUsergroup)

app.post('/groups/blog', db.createBloggroup)
app.put('/groups/blog', db.updateBloggroup)

app.post('/blogs', db.createBlog)

app.put('/blogs/group', db.groupBlog)



app.listen(port, () => {
	console.log(`App running on port ${port}`);
});
