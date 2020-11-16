const port = 3000;
const def_blogs_per_page = 3;
var express = require('express');
var ejs = require('ejs');
var app = express();
var api = require('./api/api.js');
var db = api.db;
//var db.datareq = api.db.datareq;
//var db.exis = api.db.exis;
//var db.quan = api.db.quan;
// var auth = require('./auth/authmiddleware.js');
var fetch = require('node-fetch');
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');

const paseto = require('paseto');
const plman = require('./auth/payloadmanager.js');
const {V2} = paseto;
var bodyParser = require('body-parser');

(async () => {
	const key = await V2.generateKey('local')
	app.set('key', key);
})()

app.set('views', '../views');
app.set('view engine','ejs');

app.set('pagination', {'blog_def': 6,'ticket_def': 8});

app.use('/api', api.router/*, function (req, res) {
	res.sendStatus(401);
}*/);

function validateBanner(req, res, next) {
	try {
		ejs.render('templates/alert/' + req.cookies.banner)
	} catch(err) {
		res.locals.banner = 'auth/failure_default';
		next();
	}
	res.locals.banner = req.cookies.banner;
	next();
}

function clearBanner(req, res, next) {
	res.cookie('banner', 'none').set('cookie set');
	//console.log(req.cookies);
	next();
}

async function revalidate_login(req, res, next) {
	const token = req.cookies.token
	if(token === undefined) {
		next();
	} else {
		var key = await app.get('key');
		payload = {};
		try {
			payload = await plman.validate(token, key);
			console.log(payload);
		} catch(err) {
			console.log(err);
			res.cookie('banner','auth/invalid_default').set('cookie set');
			res.clearCookie('token');
			res.redirect('/');
		}
		//res.cookie('banner','auth/user_login/success_default').set('cookie set');
		//res.redirect('/');
		res.locals.authed = true;
		if(req.internal === undefined) {
			req.internal = {};
		}
		req.internal.payload = payload;
		next();
	}
}

app.use(cookieParser());
app.use(bodyParser.json());
app.use('/', function(req, res, next) {
	console.log(req.cookies);
	next();
});

app.locals.banner = 'none';//"auth/user_login/success_default";
app.locals.authed = false;
var stdin = process.openStdin();

stdin.addListener("data", async function(d) {
	const input = d.toString().trim();
	console.log("input: " + input);

	(async () => {
		var data = db.datareq.getUserById(1);
		var key = await app.get('key');
		console.log(plman.tokenize(data, key));
		x = await plman.construct("benglish4@gulls.salisbury.edu", "login_auth", 1440, []);
		console.log(x);
	})()

});

//------------- email info here ----------------

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'hp000test@gmail.com',
		pass: 'cosc426!2020'
	}
});
/*
transporter.sendMail(mailOptions, function(error, info){
	if (error) {
		console.log(error);
	} else {
		console.log('Email sent: ' + info.response);
	}
});
*/
//-------------------------------------------------

// TODO: Create a router for middleware separation
app.get('/auth', async function(req, res) {
	if(req.query.token !== undefined) {
		t = req.query.token;
	} else {
		t = req.cookies.token;
	}
	const token = t;

	if(token === undefined) {
		res.redirect('/');
	} else {
		var key = await app.get('key');
		try {
			payload = await plman.validate(token, key);
			console.log(payload);
		} catch(err) {
			console.log(err);
			res.cookie('banner','auth/failure_default').set('cookie set');
			res.redirect('/');
			return;
		}
		res.cookie('token', token).set('cookie set');
		res.cookie('banner','auth/user_login/success_default');
		res.redirect('/');
	}
});

app.get('/login', function(req, res){
 	res.render('pages/user_accounts/login');
});


app.post('/login', function(req, res){

	console.log(req.body.email);

	//G: 11/11 if logged in already --> redirect to home

	res.end();
});

app.get('/register', function(req, res){
	res.render('pages/user_accounts/register');
});
/*
app.post('/register', function(req, res){

	//check users for validation
	var email = await fetch('http://localhost:3000/api/user/email/' + req.query.email).then(qres => qres.json());

	//if email is not in db, will return empty array
	if email == {}:
		x = await plman.tokenize(plman.construct(req.query.email, "reg_auth", 1440, []),key);
		console.log(x);

		var mailOptions = {
			from: 'hp000test@gmail.com',
			to: req.query.email,
			subject: 'HPCL Register Authenication',
			text: 'http://localhost:3000/regauth?token=' + x //where x is the new user's token
		};

		//send email via library system

	else:
		//banner 'user already in system' pop up here
});
*/
/*
app.get('/regauth', async function(req, res) {
	if(req.query.token !== undefined) {
		t = req.query.token;
	} else {
		t = req.cookies.token;
	}
	const token = t;

	if(token === undefined) {
		res.redirect('/');
	} else {
		var key = await app.get('key');
		try {
			payload = await plman.validate(token, key);
			console.log(payload);
		} catch(err) {
			console.log(err);
			res.cookie('banner','auth/failure_default').set('cookie set');
			res.redirect('/');
			return;
		}

		if(payload.type == "reg_auth") {
			res.cookie('token', token).set('cookie set');

			res.cookie('banner','auth/user_login/success_default');
		}
		res.redirect('/');
	}
});
*/


app.get('/blog/create', [revalidate_login], async function(req, res) {
	const payload = req.internal.payload;

	if((await plman.authorityCheck(payload, "content.create")) == true) {
			res.render('pages/createblog');
	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.redirect('/');
	}
});

app.post('/blog/create', [revalidate_login], async function(req, res){


	const payload = req.internal.payload;
	if((await plman.authorityCheck(payload, "content.create")) == true) {
			var email = payload.email;
			//email_query = await fetch('http://localhost:3000/api/user/email/' + email).then(qres => qres.json());
			var email_query = await db.exis.checkUserExistsByEmail(email).then(results => results.rows[0]); // TODO: Add error handling
			var user_id = email_query.id;

			var title = req.body.title;
			var body = req.body.blog_content;
			var group = 0;

			console.log(req.body.title);
			console.log(req.body.blog_content);

			var b_id = await db.create.blog(title, user_id, group, body).then(results => results.rows[0].id);

			res.redirect('/blog/' + b_id);
			res.end();
	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.redirect('/');
	}

});

app.get('/myblogs', [validateBanner, clearBanner, revalidate_login], async function(req, res) {
	const token = req.cookies.token
	var key = await app.get('key');
	try {
		payload = await plman.validate(token, key);
		console.log(payload);
	} catch(err) {
		console.log(err);
		res.cookie('banner','auth/invalid_default').set('cookie set');
		res.redirect('/');
		return;
	}
	email_query = await db.exis.checkUserExistsByEmail(email).then(results => results.rows[0]);	// TODO: Add error handling
	id = email_query.id;
	db.datareq.getBlogsByAuthorId(id).then(results => results.rows).then(qres => res.render('pages/blogs/myblogs', {blogs: qres}));
});

app.get('/blog/:id([0-9]+)', [revalidate_login], async function(req, res) {
	/*const token = req.cookies.token
	var key = await app.get('key');
	try {
		payload = await plman.validate(token, key);
		console.log(payload);
	} catch(err) {
			console.log(err);
			res.cookie('banner','auth/invalid_default').set('cookie set');
			res.redirect('/');
			return;
	}
	email = payload.email;
	email_query = await fetch('http://localhost:3000/api/user/email/' + email).then(qres => qres.json());
	id = email_query.id;
	*/

	db.datareq.getBlogById(parseInt(req.params.id)).then(results => results.rows[0]).then(qres => res.render('pages/blogs/singleblog', {blog: qres}));
	/*ticket_query = await fetch('http://10.0.0.233:3000/api/ticket/' + req.params.id).then(qres => qres.json());
	console.log(ticket_query);
	if(id != ticket_query.creator) {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.redirect('/mytickets');
	} else {
		res.render('pages/tickets/singleticket', {ticket: ticket_query});
	}*/
});

app.get('/b', [revalidate_login], function(req, res) {
	res.redirect('/blogs');
});

app.get('/blogs/:bg', [revalidate_login], function(req, res) {
	res.redirect('/b/' + req.params.bg);
});

async function blog_pagination_check(req, res, next) {
	if(req.query.page === undefined) {
		req.query.page = 0;
	} else {
		req.query.page = parseInt(req.query.page);	// TODO: Add error handling for NaN and #<1
	}
	if(req.query.view === undefined) {
		req.query.view = app.get('pagination').blog_def;
	} else {
		req.query.view = parseInt(req.query.view);	// TODO: Add error handling for NaN and #<1
	}
	next();
}

app.get('/blogs', [revalidate_login, blog_pagination_check], async function(req, res){
	//this for blog gen from db

	res.locals.total = db.quan.getCountOfBlogs().then(qres => qres.rows[0].count);
	res.locals.pagecnt = res.locals.total/req.query.view;
	if(res.locals.total % req.query.view != 0) {
		res.locals.pagecnt = res.locals.pagecnt+1
	}
	res.locals.currpage = req.query.page;
	res.locals.stdview = (req.query.view == app.get('pagination').blog_def)
	res.locals.redirect = req.path
	offset = req.query.page*req.query.view;
	db.datareq.getBlogsSubset(offset, req.query.view).then(results => results.rows).then(qres => res.render('pages/bloghome', {blogs: qres}));
});

app.get('/b/:bg', [revalidate_login, blog_pagination_check], async function (req, res) {
	p = parseInt(req.query.page)
	if(isNaN(p)) {
		p = 0;
	}
	origin = parseInt(req.query.origin)
	if(isNaN(origin)) {
		origin = (p*def_blogs_per_page)
	}

	group = req.params.bg;
	numeric = true;
	try {
		group = parseInt(group);
	} catch(err) {
		numeric = false;
	}

	group_id = group;
	if(!numeric) {
		group_id = await db.datareq.getBloggroupByName(group).then(qres => qres.rows[0]).then(qres => parseInt(qres));
	}

	total = await db.quan.getCountOfBlogsByGroupIdOffsetBy(group_id, 0).then(qres => parseInt(qres.rows[0]));

	console.log("group: " + group + "\ngroup id: " + group_id + "\ncount: " + total + "\norigin: " + origin);
	db.datareq.getBlogsByGroupIdOffsetBy(group_id, origin).then(results => results.rows).then(qres => res.render("pages/bloghome", {blogs: qres}));
});

/*app.get('/b/:bg', function(req, res) {
	p = parseInt(req.query.page);
	if(isNaN(p)) {
		res.redirect('/b/' + req.params.bg);
	}
}*/

app.get('/tt', function(req, res, next) {
	(async () => {
		var data = await db.datareq.getUserById(1);
		var key = await app.get('key');
		x = await plman.tokenize(plman.construct("login_auth", "benglish4@gulls.salisbury.edu", 1440, []),key);
		console.log(x);
		res.cookie('token', x).set('cookie set');
		res.redirect('/auth');
	})()
});

app.get('/tt2', function(req, res, next) {
	(async () => {
		var data = await db.datareq.getUserById(1);
		var key = await app.get('key');
		x = "badtokentest"
		console.log(x);
		res.cookie('token', x).set('cookie set');
		res.redirect('/auth');
	})()
});

app.get('/tt3', function(req, res, next) {
	(async () => {
		var data = await db.datareq.getUserById(1);
		var key = await app.get('key');
		x = x = await plman.tokenize(plman.construct("rcquackenbush@salisbury.edu", "login_auth", 1440, []),key);
		console.log(x);
		res.cookie('token', x).set('cookie set');
		res.redirect('auth');
	})()
});

app.get('/cc', function(req, res) {
	res.clearCookie('token');
	res.render('pages/home');
});

// grace middleware

app.get('/ticket/create', [revalidate_login], function(req, res) {

	res.render('pages/ticketcreation');
});

app.post('/ticket/create', async function(req, res){

	const token = req.cookies.token
	var key = await app.get('key');

	try {
		payload = await plman.validate(token, key);
		console.log(payload);
	} catch(err) {
		console.log(err);
		res.cookie('banner','auth/invalid_default').set('cookie set');
		res.redirect('/');
		return;
	}
	var email = payload.email;
	//email_query = await fetch('http://localhost:3000/api/user/email/' + email).then(qres => qres.json());
	var email_query = await db.exis.checkUserExistsByEmail(email).then(results => results.rows[0]); // TODO: Add error handling
	var user_id = email_query.id;

	var ticket_title = req.body.title;
	var ticket_body = req.body.ticket_info;
	console.log(ticket_title);
	console.log(ticket_body);

	var ticket_id = db.createTicket(user_id, ticket_title, ticket_body);

	res.redirect('/ticket/' + ticket_id); //redirect
	res.end();
});

app.get('/tickets', [revalidate_login], function(req, res) {
	db.datareq.getTickets().then(qres => res.render('pages/ticketlist', {tickets: qres}));

});

app.get('/mytickets', [validateBanner, clearBanner, revalidate_login], async function(req, res) {
	const token = req.cookies.token
	var key = await app.get('key');
	try {
		payload = await plman.validate(token, key);
		console.log(payload);
	} catch(err) {
			console.log(err);
			res.cookie('banner','auth/invalid_default').set('cookie set');
			res.redirect('/');
			return;
	}
	email = payload.email;
	email_query = await db.exis.checkUserExistsByEmail(email).then(results => results.rows[0]);	// TODO: Add error handling
	id = email_query.id;
	db.datareq.getTicketsForUser(id).then(results => results.rows).then(qres => res.render('pages/tickets/mytickets', {tickets: qres}));
});

app.get('/myblogs', [validateBanner, clearBanner, revalidate_login], async function(req, res) {
	const token = req.cookies.token
	var key = await app.get('key');
	try {
		payload = await plman.validate(token, key);
		console.log(payload);
	} catch(err) {
			console.log(err);
			res.cookie('banner','auth/invalid_default').set('cookie set');
			res.redirect('/');
			return;
	}
	//email_query = await fetch('http://localhost:3000/api/user/email/' + email).then(qres => qres.json());
	email_query = await db.exis.checkUserExistsByEmail(email).then(results => results.rows[0]);	// TODO: Add error handling
	id = email_query.id;
	//fetch('http://10.0.0.233:3000/api/blogs/by' + 1).then(qres => qres.json()).then(qres => res.render('pages/blogs/myblogs', {blogs: qres}));
	db.getBlogsByAuthorId(id).then(results => results.rows).then(qres => res.render('pages/blogs/myblogs', {blogs: qres}));
});

app.get('/blog/:id([0-9]+)', [revalidate_login], async function(req, res) {

	db.getBlogById(parseInt(req.params.id)).then(results => results.rows[0]).then(qres => res.render('pages/blogs/singleblog', {blog: qres}));

	//if logged in as admin, edit privileges?
});

app.get('/ticket/:id([0-9]+)', [revalidate_login], async function(req, res) {
	const token = req.cookies.token
	var key = await app.get('key');
	try {
		payload = await plman.validate(token, key);
		console.log(payload);
	} catch(err) {
			console.log(err);
			res.cookie('banner','auth/invalid_default').set('cookie set');
			res.redirect('/');
			return;
	}
	email_query = await db.exis.checkUserExistsByEmail(email).then(results => results.rows[0]);	// TODO: Add error handling
	id = email_query.id;
	console.log(id)
	ticket_query = await db.datareq.getTicketById(parseInt(req.params.id)).then(results => results.rows[0]);
	console.log(ticket_query);
	if(user_id != ticket_query.creator) {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.redirect('/mytickets');
	}
	else {
		res.render('pages/tickets/singleticket', {ticket: ticket_query});
	}
});

/*
app.get('/admin', [revalidate_login], function(req, res){
	//fetch('http://localhost:3000/api/tickets').then(qres => qres.json()).then(qres => res.render('pages/adminhome', {tickets: qres}));
});
*/
/*
app.get('/admin/tickets', [revalidate_login], async function(req, res){
	var x = await fetch('http://localhost:3000/api/tickets');
	var y = await fetch('http://localhost:3000/api/users');

	x = await x.json();
	y = await y.json();

	// console.log(x);
	// await console.log(y);

	res.render('pages/adminhome', {tickets: x, users: y})
});
*/
/*
app.get('/admin/tickets/:id', [revalidate_login], function(req, res){
	id = req.params.id;
	console.log(id);
	fetch('http://localhost:3000/api/ticket/' + id).then(qres => qres.json()).then(qres => res.render('pages/ticketadmin', {ticket: qres}));
});
*/
/*
app.get('/ticket/create', function(req, res){
	fetch('http://localhost:3000/api/tickets').then(qres => qres.json()).then(qres => res.render('pages/ticketadmin', {tickets: qres}));
});
*/
/*
app.get('/admin/users/:id', [revalidate_login], function(req, res){
	id = req.params.id;
	console.log(id);
	fetch('http://localhost:3000/api/users/'+ id).then(qres => qres.json()).then(qres => res.render('pages/userdisplay', {user: qres}));
});
*/

//app.use('/', validateBanner);

//app.use('/', clearBanner);

// TODO:	setup a login route that makes a banner cookie and redirects here.
//			make a middleware to handle and reset it here it
app.get('/', [validateBanner, clearBanner, revalidate_login], function(req, res, next) {
	res.render('pages/home');
	next();
});

app.listen(port, () => {
	console.log(`App running on port ${port}`);
});

/*(async () => {
console.log("Test: " + await db.perm.userHasPerm(1, 1));
})();*/
