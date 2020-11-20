const port = 3000;
const def_blogs_per_page = 3;
var express = require('express');
var ejs = require('ejs');
var app = express();
var api = require('./api/api.js');
var db = api.db;
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

app.set('pagination', {'profile': {'blog_def': 5, 'ticket_def': 5}, 'blog_def': 6,'ticket_def': 8});

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

async function verify_signin(req, res, next) {
	const token = req.cookies.token;
	if(token === undefined) {
		res.cookie('banner', 'auth/signin_required').set('cookie set');
		res.redirect('/');
	} else {
		next();
	}
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
		res.locals.authed = true;
		if(req.internal === undefined) {
			req.internal = {};
		}
		req.internal.auth = true;
		req.internal.payload = payload;
		email = req.internal.payload.email;
		email_query = await db.datareq.getUserByEmail(email).then(results => results.rows[0]);	// TODO: Add error handling
		req.internal.user_id = email_query.id;
		next();
	}
}

async function blog_pagination_check(req, res, next) {
	if(req.query.page === undefined) {
		req.query.page = 0;
	} else {
		req.query.page = parseInt(req.query.page);	// TODO: Add error handling for NaN and #<1
	}
	if(req.query.view === undefined) {
		req.query.view = app.get('pagination').blog_def;	// TODO: Add ability to specify default from parameter
	} else {
		req.query.view = parseInt(req.query.view);	// TODO: Add error handling for NaN and #<1
	}
	next();
}

async function prepare_pagination(path, page, view, total, prefix) {
	total = parseInt(total);
	payload = {'total': total}
	payload.view = view;
	payload.currpage = page;
	payload.pagecnt = parseInt((payload.total/payload.view));
	if(payload.total % payload.view != 0) {
		payload.pagecnt = payload.pagecnt+1;
	}
	payload.pagemax = payload.pagecnt-1;
	if(prefix === undefined) {
		prefix = "";
	}
	payload.prefix = prefix;
	return payload;

}

async function handle_signout(req, res, next) {
	if(req.query.signout == true || req.query.signout == 'true' || req.query.signout == 'True' || req.query.signout == 'TRUE') {
		if(req.cookies.token == undefined) {
			res.cookie('banner','auth/user_logout/failure_notsignedin').set('cookie set');
		} else {
			res.cookie('banner','auth/user_logout/success_default').set('cookie set');
		}
		res.clearCookie('token');
		res.redirect('/');
	} else {
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

async function getTokenFromQuery(req, res, next) {
	/*if(req.query.token !== undefined) {
		t = req.query.token;
	} else {
		t = req.cookies.token;
	}*/
	if(req.query.token !== undefined) {
		res.cookie('token', req.query.token).set('cookie set');
	}
	next();
}
// TODO: Create a router for middleware separation
app.get('/auth', [getTokenFromQuery], async function(req, res, next) {

	if(req.cookies.token === undefined) {
		res.cookie('banner','auth/failure_default').set('cookie set');
		res.redirect('/');
	} else {
		var token = req.cookies.token;
	}

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

async function profile_pagination_check(req, res, next) {
	if(req.query.ticketpage === undefined) {
		req.query.ticketpage = 0;
	} else {
		req.query.ticketpage = parseInt(req.query.ticketpage);	// TODO: Add error handling for NaN and #<1
	}
	if(req.query.ticketview === undefined) {
		req.query.ticketview = app.get('pagination').blog_def;
	} else {
		req.query.ticketview = parseInt(req.query.ticketview);	// TODO: Add error handling for NaN and #<1
	}

	if(req.query.blogpage === undefined) {
		req.query.blogpage = 0;
	} else {
		req.query.blogpage = parseInt(req.query.blogpage);	// TODO: Add error handling for NaN and #<1
	}
	if(req.query.blogview === undefined) {
		req.query.blogview = app.get('pagination').blog_def;
	} else {
		req.query.blogview = parseInt(req.query.blogview);	// TODO: Add error handling for NaN and #<1
	}
	next();
}
/*
app.get('/blogs', [revalidate_login, blog_pagination_check], async function(req, res){
	//this for blog gen from db

	res.locals.total = await db.quan.getCountOfBlogs().then(qres => qres.rows[0].count);
	res.locals.pagecnt = res.locals.total/req.query.view;
	if(res.locals.total % req.query.view == 0) {
		res.locals.pagecnt = res.locals.pagecnt-1
	}
	res.locals.currpage = req.query.page;
	res.locals.stdview = (req.query.view == app.get('pagination').blog_def)
	res.locals.redirect = req.path
	offset = req.query.page*req.query.view;
	db.datareq.getBlogsSubset(offset, req.query.view).then(results => results.rows).then(qres => res.render('pages/bloghome', {blogs: qres}));
});
*/
app.get('/profile', [validateBanner, clearBanner, verify_signin, revalidate_login, profile_pagination_check], async function(req, res, next) {
	const user_id = parseInt(req.internal.user_id);
	const blog_page_data = await db.quan.getCountOfBlogs().then(qres => qres.rows[0].count).then(total => prepare_pagination(req.path, req.query.blogpage, req.query.blogview, total, "blog"));
	blog_offset = blog_page_data.currpage*blog_page_data.view;
	res.locals.blog_page_data = blog_page_data;
	blog_data = await db.datareq.getBlogsSubset/*ByUserId*/(/*user_id, */blog_offset, blog_page_data.view).then(results => results.rows);	// TODO: Change to be blogs for that user
	const ticket_page_data = await db.quan.getTicketCount().then(qres => qres.rows[0].count).then(total => prepare_pagination(req.path, req.query.ticketpage, req.query.ticketview, total, "ticket"));
	ticket_offset = ticket_page_data.currpage*ticket_page_data.view;
	res.locals.ticket_page_data = ticket_page_data;
	ticket_data = await db.datareq.getTicketsSubset/*ByUserId*/(/*user_id, */ticket_offset, ticket_page_data.view).then(results => results.rows);	// TODO: Change to be blogs for that user
	res.locals.redirect_data = {
		'redirect': req.path,
		'queries': {
			'blogpage': req.query.blogpage,
			'blogview': req.query.blogview,
			'ticketpage': req.query.ticketpage,
			'ticketview': req.query.ticketview
		}
	};
	res.render('pages/user_accounts/profile', {blogs: blog_data, tickets: ticket_data})
});

app.get('/signout', [validateBanner, clearBanner, verify_signin, revalidate_login, handle_signout], function(req, res, next) {
	res.render('pages/user_accounts/signout')
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


app.get('/blog/create', [verify_signin, revalidate_login], async function(req, res) {
	const payload = req.internal.payload;
	if((await plman.authorityCheck(payload, "content.create")) == true) {
			res.render('pages/createblog');
	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.redirect('/');
	}
});

app.post('/blog/create', [verify_signin, revalidate_login], async function(req, res){

	const payload = req.internal.payload;
	if((plman.authorityCheck(payload, "content.create")) == true) {

			var user_id = req.internal.user_id
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

app.get('/myblogs', [validateBanner, clearBanner, verify_signin, revalidate_login], async function(req, res) {
	const payload = req.internal.payload;
	if((await plman.authorityCheck(payload, "content.create")) == true || (await db.hist.userAuthoredBlogs(req.internal.user_id)) == true) {
		res.locals.redirect_data = {
			'redirect': req.path,
			'queries': {
				'page': req.query.page,
				'view': req.query.view
			}
		};
		db.datareq.getBlogsByAuthorId(req.internal.user_id).then(results => results.rows).then(qres => res.render('pages/blogs/myblogs', {blogs: qres}));
	} else {
		res.cookie('banner', 'error/unauthorized_view').set('cookie set');
		res.redirect('/');
	}
});

app.get('/blog/:id([0-9]+)', [revalidate_login], async function(req, res) {
	db.datareq.getBlogById(parseInt(req.params.id)).then(results => results.rows[0]).then(qres => res.render('pages/blogs/singleblog', {blog: qres}));
});

app.get('/b', [revalidate_login], function(req, res) {
	res.redirect('/blogs');
});

app.get('/blogs/:bg', [revalidate_login], function(req, res) {
	res.redirect('/b/' + req.params.bg);
});

app.get('/blogs', [revalidate_login, blog_pagination_check], async function(req, res){
	const page_data = await db.quan.getCountOfBlogs().then(qres => qres.rows[0].count).then(total => prepare_pagination(req.path, req.query.page, req.query.view, total,""));
	offset = page_data.currpage*page_data.view;
	res.locals.page_data = page_data;
	res.locals.redirect_data = {
		'redirect': req.path,
		'queries': {
			'page': req.query.page,
			'view': req.query.view
		}
	};
	db.datareq.getBlogsSubset(offset, (await page_data.view) ).then(results => results.rows).then(qres => res.render('pages/bloghome', {blogs: qres}));
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

app.get('/ticket/create', [verify_signin, revalidate_login], async function(req, res) {
	const payload = req.internal.payload;
	if((await plman.authorityCheck(payload, "ticket.create")) == true) {
		res.render('pages/ticketcreation');
	} else {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.redirect('/');
	}
});

app.post('/ticket/create', [revalidate_login], async function(req, res){
	const payload = req.internal.payload;
	if((await plman.authorityCheck(payload, "ticket.create")) == true) {
		var user_id = req.internal.user_id

		var ticket_title = req.body.title;
		var ticket_body = req.body.ticket_info;
		console.log(ticket_title);
		console.log(ticket_body);

		var ticket_id = db.createTicket(user_id, ticket_title, ticket_body);

		res.redirect('/ticket/' + ticket_id); //redirect
		res.end();
	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.redirect('/');
	}
});

app.get('/tickets', [revalidate_login], function(req, res) {
	db.datareq.getTickets().then(qres => res.render('pages/ticketlist', {tickets: qres}));

});

app.get('/mytickets', [validateBanner, clearBanner, verify_signin, revalidate_login], async function(req, res) {
	res.locals.redirect_data = {
		'redirect': req.path,
		'queries': {
			'page': req.query.page,
			'view': req.query.view
		}
	};
	db.datareq.getTicketsForUser(req.internal.user_id).then(results => results.rows).then(qres => res.render('pages/tickets/mytickets', {tickets: qres}));
});

app.get('/myblogs', [validateBanner, clearBanner, verify_signin, revalidate_login], async function(req, res) {
	db.datareq.getBlogsByAuthorId(req.internal.user_id).then(results => results.rows).then(qres => res.render('pages/blogs/myblogs', {blogs: qres}));
});

app.get('/blog/:id([0-9]+)', [revalidate_login], async function(req, res) {

	db.datareq.getBlogById(parseInt(req.params.id)).then(results => results.rows[0]).then(qres => res.render('pages/blogs/singleblog', {blog: qres}));

	//if logged in as admin, edit privileges?
});

app.get('/ticket/:id([0-9]+)', [verify_signin, revalidate_login], async function(req, res) {
	
	ticket_query = await db.datareq.getTicketById(parseInt(req.params.id)).then(results => results.rows[0]);
	ticket_assignee = await db.datareq.getAssignedByTicket(parseInt(req.params.id)).then(results => results.rows[0]);

	user_assigned = await db.datareq.getUserById(ticket_assignee);
	// console.log(user_assigned);

	u = req.internal.user_id;
	ticket_creator = await db.datareq.getUserById(u);
	// console.log(ticket_creator);

	if((await plman.authorityCheck(payload, "ticket.claim") == true || plman.authorityCheck(payload, "ticket.assign") == true || plman.authorityCheck(payload, "ticket.process.others")) == true) {
		res.render('pages/ticketadmin.ejs', {ticket: ticket_query, user: ticket_creator, assigned: user_assigned});
    } else {
    	console.log("user has no edit privileges");
		res.render('pages/tickets/singleticket', {ticket: ticket_query});
    }

	if(u != ticket_query.creator) {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.redirect('/mytickets');
	}
});

app.post('/ticket/status', [verify_signin, revalidate_login], async function(req, res) {

	const payload = req.internal.payload;
	if((await plman.authorityCheck(payload, "ticket.claim") == true || plman.authorityCheck(payload, "ticket.assign") == true || plman.authorityCheck(payload, "ticket.process.others")) == true) {

		var ticket_status = req.body.status;
		var ticket = req.body.ticket_id;
		console.log(ticket_status);
		console.log(ticket_id);
		//change ticket status api here
		//TODO: Add db.update
		// var t_id = db.update.ticket().then(results => results.rows[0].id);
		// res.redirect('/ticket/' + t_id);
		// res.end();

	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.redirect('/');
	}

});

app.post('/ticket/assigned', [verify_signin, revalidate_login], async function(req, res) {

	const payload = req.internal.payload;
	if((await plman.authorityCheck(payload, "ticket.claim") == true || plman.authorityCheck(payload, "ticket.assign") == true || plman.authorityCheck(payload, "ticket.process.others")) == true) {

		var assigned_admin = req.body.user_id;
		var ticket = req.body.ticket_id;
		console.log(assigned_admin);
		console.log(ticket);
		//change assigned_admin api here
		//TODO: Add db.update
		// var t_id = db.update.ticket().then(results => results.rows[0].id);
		// res.redirect('/ticket/' + t_id);
		// res.end();

	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.redirect('/');
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
app.get('/', [validateBanner, clearBanner, revalidate_login, handle_signout], function(req, res, next) {
	res.render('pages/home');
	next();
});

app.listen(port, () => {
	console.log(`App running on port ${port}`);
});

/*(async () => {
console.log("Test: " + await db.perm.userHasPerm(1, 1));
})();*/
