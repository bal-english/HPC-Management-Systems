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
			if(req.internal === undefined) {
				req.internal = {};
			}
			req.internal.payload = payload;
			email = req.internal.payload.email;
			email_query = await db.datareq.getUserByEmail(email).then(results => results.rows[0]);	// TODO: Add error handling
			if(req.internal.payload.lastNonce != email_query.nonce) {
				res.cookie('banner', 'auth/invalid_nonce').set('cookie set');
				res.clearCookie('token');
				res.redirect('/');
				delete req.internal;
				return;
			} else {
				req.internal.user_id = email_query.id;
				res.locals.authed = true;
				req.internal.auth = true;
			}
		} catch(err) {
			console.log(err);
			res.cookie('banner','auth/invalid_default').set('cookie set');
			res.clearCookie('token');
			res.redirect('/');
			return;
		}
		next();
	}
}

function blog_pagination_check(req, res, next) {
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

function prepare_pagination(path, page, view, total, prefix) {
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

function handle_signout(req, res, next) {
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

/*
app.use('/', function(req, res, next) {
	console.log(req.cookies);
	next();
});
*/

app.locals.banner = 'none';//"auth/user_login/success_default";
app.locals.authed = false;
var stdin = process.openStdin();

stdin.addListener("data", async function(d) {
	const input = d.toString().trim();
	console.log("input: " + input);

	if(input == "email") {
		send_email('hpcl000test@gmail.com', 'maps@inkwright.net', 'Hello', 'World');
	} else {

	}
});

//------------- email info here ----------------

const from_email = 'hpcl000test@gmail.com';
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: from_email,
		pass: 'cosc426!2020'
	}
});

async function send_email(from, to, sub, body) {
	return transporter.sendMail({from: from, to: to, subject: sub, text: body});
};

async function send_login_auth(to, token) {
	return send_email(from_email, to, 'SU HPCL: Login Authorization', 'localhost:3000/auth?token=' + token + '\n10.0.0.233:3000/auth?token=' + token).catch(async (err) => {
		throw err;
	});
}

async function send_reg_auth(to, token) {
	return send_email(from_email, to, 'SU HPCL: Account Registration', 'localhost:3000/auth?token=' + token + '\n10.0.0.233:3000/auth?token=' + token).catch(async (err) => {
		throw err;
	});
}

// TODO: Create a router for middleware separation
app.get('/auth', async function(req, res, next) {
	if(req.query.token === undefined) {
		if(req.cookies.token === undefined) {
			res.redirect('/');
			return;
		} else {
			res.redirect('/?signout=true');
			return;
		}
	} else {

		// Signed out message here if token !== undefined

		req.key = await app.get('key');
		plman.process(req, res).then(resp => {
			req = resp.req;
			res = resp.res;
			res.redirect('/')
		});
	}
});

app.get('/login', [validateBanner, clearBanner, revalidate_login], function(req, res){
 	res.render('pages/user_accounts/login');
});

app.post('/login', async function(req, res){
	key = await app.get('key');
	return db.datareq.getUserByEmail(req.body.email).then(results => {
		if(results.rowCount == 0) {
			return new Promise((resolve, reject) => {
				resolve(res.cookie('banner', 'mail/login/failure_noaccount'));
			}).then(newres => newres.status(200).json({'redirect': true, 'url': '/login'}));
		} else {
			return new Promise((resolve, reject) => {
				resolve(plman.construct('login_auth', req.body.email, results.rows[0].nonce))
			}).then(payload => plman.tokenize(payload, key)).then(token => {
				return new Promise(async (resolve, reject) => {
					try {
						await send_login_auth(req.body.email, token);
						resolve(res.cookie('banner', 'mail/login/success_default'));
					} catch(err) {
						reject(err);
					}
				}).catch((result) => {
					return res.cookie('banner', 'mail/login/failure_default');
				});
			}).then(newres => newres.status(200).json({'redirect': true, 'url': '/'}));
		}
	});
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
	ticket_creator = await db.datareq.getUserById(user_id).then(results => results.rows[0]);
	const blog_page_data = await db.quan.getBlogCountByUser(user_id).then(qres => qres.rows[0].count).then(total => prepare_pagination(req.path, req.query.blogpage, req.query.blogview, total, "blog"));
	blog_offset = blog_page_data.currpage*blog_page_data.view;
	res.locals.blog_page_data = blog_page_data;
	blog_data = await db.datareq.getBlogsSubsetByUserId(user_id, blog_offset, blog_page_data.view).then(results => results.rows);	// TODO: Change to be blogs for that user
	const ticket_page_data = await db.quan.getTicketCountOfUser(user_id).then(qres => qres.rows[0].count).then(total => prepare_pagination(req.path, req.query.ticketpage, req.query.ticketview, total, "ticket"));
	ticket_offset = ticket_page_data.currpage*ticket_page_data.view;
	res.locals.ticket_page_data = ticket_page_data;
	ticket_data = await db.datareq.getTicketsSubsetByUserId(user_id, ticket_offset, ticket_page_data.view).then(results => results.rows);	// TODO: Change to be blogs for that user
	res.locals.redirect_data = {
		'redirect': req.path,
		'queries': {
			'blogpage': req.query.blogpage,
			'blogview': req.query.blogview,
			'ticketpage': req.query.ticketpage,
			'ticketview': req.query.ticketview
		}
	};
	res.render('pages/user_accounts/profile', {blogs: blog_data, tickets: ticket_data, user: ticket_creator})
});

app.get('/newprofile', [validateBanner, clearBanner, verify_signin, revalidate_login, profile_pagination_check], async function(req, res, next) {
	const user_id = parseInt(req.internal.user_id);
	ticket_creator = await db.datareq.getUserById(user_id).then(results => results.rows[0]);
	const blog_page_data = await db.quan.getBlogCountByUser(user_id).then(qres => qres.rows[0].count).then(total => prepare_pagination(req.path, req.query.blogpage, req.query.blogview, total, "blog"));
	blog_offset = blog_page_data.currpage*blog_page_data.view;
	res.locals.blog_page_data = blog_page_data;
	blog_data = await db.datareq.getBlogsSubsetByUserId(user_id, blog_offset, blog_page_data.view).then(results => results.rows);	// TODO: Change to be blogs for that user
	const ticket_page_data = await db.quan.getTicketCountOfUser(user_id).then(qres => qres.rows[0].count).then(total => prepare_pagination(req.path, req.query.ticketpage, req.query.ticketview, total, "ticket"));
	ticket_offset = ticket_page_data.currpage*ticket_page_data.view;
	res.locals.ticket_page_data = ticket_page_data;
	ticket_data = await db.datareq.getTicketsSubsetByUserId(user_id, ticket_offset, ticket_page_data.view).then(results => results.rows);	// TODO: Change to be blogs for that user
	res.locals.redirect_data = {
		'redirect': req.path,
		'queries': {
			'blogpage': req.query.blogpage,
			'blogview': req.query.blogview,
			'ticketpage': req.query.ticketpage,
			'ticketview': req.query.ticketview
		}
	};
	res.render('pages/user_accounts/profile', {blogs: blog_data, tickets: ticket_data, user: ticket_creator})
});

app.use('/profile/reset', async (req, res, next) => {
	const token = req.cookies.token
	if(token === undefined) {
		res.cookie('banner','auth/invalid_default').set('cookie set');
		res.clearCookie('token');
		return res.status(400);
	} else {
		var key = await app.get('key');
		payload = {};
		try {
			payload = await plman.validate(token, key);
		} catch(err) {
			console.log(err);
			res.cookie('banner','auth/invalid_default').set('cookie set');
			res.clearCookie('token');
			return res.status(400);
		}
		res.locals.authed = true;
		if(req.internal === undefined) {
			req.internal = {};
		}
		req.internal.auth = true;
		req.internal.payload = payload;
		//console.log(req.internal.payload);
		email = req.internal.payload.email;
		email_query = await db.datareq.getUserByEmail(email).then(results => results.rows[0]);	// TODO: Add error handling
		req.internal.user_id = email_query.id;
		next();
	}
});

app.post('/profile/reset', async function(req, res, next) {
	console.log(req.cookies.token);

	//res.status(200);
	return await db.update.user.nonce(req.internal.user_id).then(results => results.rowCount).then(async (rowCount) => {
		if(rowCount == 0) {
			return new Promise((resolve, reject) => {
				resolve(res.cookie('banner', 'auth/failure_default'));
			}).then(newres => newres.status(400).json({'redirect': true, 'url': '/'}));
		} else {
			return new Promise((resolve, reject) => {
				resolve(res.clearCookie('token'));
			}).then(newres => newres.cookie('banner', 'auth/user_logout/success_all')).then(newres => newres.status(200).json({'redirect': true, 'url': '/'}));
		}
	})
});

app.get('/signout', [validateBanner, clearBanner, verify_signin, revalidate_login, handle_signout], function(req, res, next) {
	res.render('pages/user_accounts/signout')
});

app.get('/register', [validateBanner, clearBanner], function(req, res){
	res.render('pages/user_accounts/register');
});

/*
app.post('/register', async function(req, res) {
	key = await app.get('key');
	return db.datareq.getUserByEmail(req.body.email).then(results => {
		if(results.rowCount == 0) {
			return new Promise((resolve, reject) => {
				resolve(plman.construct('reg_auth', req.body.email))
			}).then(payload => plman.tokenize(payload, key)).then(async (token) => {
				return new Promise(async (resolve, reject) => {
					try {
						send_reg_auth(req.body.email, token);
						resolve(res.cookie('banner', 'mail/reg/success_default'));
					} catch(err) {
						reject(err);
					}
				});
			}).catch(result => {
				return res.coookie('banner', 'mail/reg/failure_default');
			}).then(newres => newres.status(200).json({'redirect': true, 'url': '/'}));
		} else {
			return new Promise((resolve, reject) => {
				resolve(res.cookie('banner', 'mail/reg/failure_emailtaken'))
			}).then(newres => newres.status(403).json({'redirect': true, 'url': '/register'}));	// TODO: Is this the right HTTP status for this?
		}
	})
})
*/
app.post('/register', async function(req, res) {
	key = await app.get('key');
	return db.datareq.getUserByEmail(req.body.email).then(results => {
		if(results.rowCount == 0) {
			return new Promise((resolve, reject) => {
				resolve(plman.construct('reg_auth', req.body.email))
			}).then(payload => {
				payload.setup.data.firstName = req.body.first;
				return payload;
			}).then(payload => {
				payload.setup.data.lastName = req.body.last;
				return payload;
			}).then(payload => plman.tokenize(payload, key)).then(async (token) => {
				return new Promise(async (resolve, reject) => {
					try {
						await send_reg_auth(req.body.email, token)
						resolve(res.cookie('banner', 'mail/reg/success_default'));
					} catch(err) {
					//	console.log('err');
						reject(err);
					}
				}).catch(err => {
					return res.cookie('banner', 'mail/reg/failure_default');
				});
			}).then(newres => newres.status(200).json({'redirect': true, 'url': '/'}));
		} else {
			return new Promise((resolve, reject) => {
				resolve(res.cookie('banner', 'mail/reg/failure_emailtaken'))
			}).then(newres => newres.status(200).json({'redirect': true, 'url': '/register'}));	// TODO: Is this the right HTTP status for this?
		}
	});
});

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
	if((await plman.authorityCheck(payload, "content.create")) == true) {

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

app.get('/blog/:id([0-9]+)', [revalidate_login], function(req, res) {
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

app.get('/rtt', function(req, res, next) {
	(async () => {
		var key = await app.get('key');
		x = await plman.tokenize(plman.construct("reg_auth", "maps@inkwright.net"), key);
		//console.log(x);
		res.redirect('/auth?token=' + (await x));
	})()
});

;

app.get('/tt', function(req, res, next) {
	(async () => {
		var data = await db.datareq.getUserById(1).then(results => results.rows[0]);
		var key = await app.get('key');
		x = await plman.tokenize(plman.construct("login_auth", "benglish4@gulls.salisbury.edu", data.nonce), key);
		//res.cookie('token', x).set('cookie set');
		res.redirect('/auth?token=' + (await x));
	})()
});

app.get('/tt2', function(req, res, next) {
	(async () => {
		var key = await app.get('key');
		x = "badtokentest"
		res.cookie('token', x).set('cookie set');
		res.redirect('/auth');
	})()
});

app.get('/tt3', function(req, res, next) {
	(async () => {
		var data = await db.datareq.getUserById(5).then(results => results.rows[0]);
		var key = await app.get('key');
		x = x = await plman.tokenize(plman.construct("login_auth", "rcquackenbush@salisbury.edu", data.nonce), key);
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

// app.get('/tickets', [revalidate_login], function(req, res) {
// 	db.datareq.getTickets().then(qres => res.render('pages/ticketlist', {tickets: qres}));

// });

app.get('/mytickets', [validateBanner, clearBanner, verify_signin, revalidate_login], function(req, res) {
	res.locals.redirect_data = {
		'redirect': req.path,
		'queries': {
			'page': req.query.page,
			'view': req.query.view
		}
	};
	db.datareq.getTicketsForUser(req.internal.user_id).then(results => results.rows).then(qres => res.render('pages/tickets/mytickets', {tickets: qres}));
});

app.get('/myblogs', [validateBanner, clearBanner, verify_signin, revalidate_login], function(req, res) {
	db.datareq.getBlogsByAuthorId(req.internal.user_id).then(results => results.rows).then(qres => res.render('pages/blogs/myblogs', {blogs: qres}));
});

app.get('/blog/:id([0-9]+)', [revalidate_login], function(req, res) {

	db.datareq.getBlogById(parseInt(req.params.id)).then(results => results.rows[0]).then(qres => res.render('pages/blogs/singleblog', {blog: qres}));

	//if logged in as admin, edit privileges?
});

app.get('/ticket/:id([0-9]+)', [verify_signin, revalidate_login], async function(req, res) {
	ticket_query = await db.datareq.getTicketById(parseInt(req.params.id)).then(results => results.rows[0]);
	if(req.internal.user_id != ticket_query.creator) {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.redirect('/mytickets');
	}
	else {
		res.render('pages/tickets/singleticket', {ticket: ticket_query});
	}
});


app.get('/newticket/:id([0-9]+)', [verify_signin, revalidate_login], async function(req, res) {

	const ticket_id = await parseInt(req.params.id);

	ticket_query = await db.datareq.getTicketById(ticket_id).then(results => results.rows[0]);

	// This breaks when no one has been assigned. Also, what is it supposed to return? Right now the it will return a JSONObject such as {"ticket_id": x, "user_id": y}
	// - Alex
	ticket_assignee = await db.datareq.getAssignedByTicket(ticket_id).then(results => results.rows[0]);

	user_assigned = await db.datareq.getUserById(ticket_assignee);
	// console.log(user_assigned);

	//this is the user id
	u = parseInt(req.internal.user_id);
	// console.log("ID: " + u);
	// console.log("---------------------------");

	ticket_creator = await db.datareq.getUserById(u).then(results => results.rows[0])//.then(result => parseInt(result));
	t_creator = JSON.stringify(ticket_creator);
	// console.log("ticket creator:" + ticket_creator);
	// console.log("JSON'd ticket creator:" + t_creator);
	// console.log("---------------------------");

	//// These auth checks each need to have an await, or they need to be chained with .then()
	if((await plman.authorityCheck(payload, "ticket.claim") == true) || (await plman.authorityCheck(payload, "ticket.assign") == true) || (await plman.authorityCheck(payload, "ticket.process.others") == true)) {
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
		var ticket_id = req.body.ticket_id;
		console.log(ticket_status);
		console.log(ticket_id);

		var t_id = db.update.ticketStatus(ticket_id, ticket_status).then(results => results.rows[0].id);
		res.redirect('/ticket/' + t_id);
		res.end();

	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.redirect('/');
	}

});

app.post('/ticket/assigned', [verify_signin, revalidate_login], async function(req, res) {

	const payload = req.internal.payload;
	if((await plman.authorityCheck(payload, "ticket.claim") == true || plman.authorityCheck(payload, "ticket.assign") == true || plman.authorityCheck(payload, "ticket.process.others")) == true) {

		var assigned_admin = req.body.user_id;
		var ticket_id = req.body.ticket_id;
		console.log(assigned_admin);
		console.log("ticket id: " + ticket_id);

		var t_id = db.update.ticketAssigned(ticket_id, assigned_admin).then(results => results.rows[0].id);
		res.redirect('/ticket/' + t_id);
		res.end();

	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.redirect('/');
	}
});

app.get('/admin/manage/usergroup', [verify_signin, revalidate_login], async function(res, res, next) {
	if((await plman.authorityCheck(payload, "db.admin") == true) || (await plman.authorityCheck(payload, "user.deactivate.others") == true)) {
		res.render('pages/admin/usergroup-management');
	} else {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.redirect('/');
	}
});

app.post('/admin/manage/usergroup/perm', [], async function(req, res, next) {
	exists = {};
	exists.group = await db.exis.checkUsergroupExistsById(req.body.group_id).then(results => results.rows[0].case == 1);
	exists.perm = await db.exis.checkPermExistsById(req.body.perm_id).then(results => results.rows[0].case == 1);
	exists.connection = await db.exis.checkUsergroupHasPerm(req.body.group_id, req.body.perm_id).then(results => results.rows[0].case == 1);
	result = {'success': false};
	if(exists.group && exists.perm && !exists.connection) {
		try {
			await db.connect.givePermToUsergroup(req.body.group_id, req.body.perm_id);
			result = {'success': true};
		} catch(err) {
			console.log(err);
			result = await {'success': false, 'err': err.toString()};
		}
	}
	htmlResponse = await new Promise((resolve, reject) => {
		if(result.success) {
			return resolve(ejs.renderFile('../views/templates/alert/std/success.ejs', {message: 'Permission successfully given to Usergroup.'}));
		} else {
			if(exists.group && exists.perm) {
				if(exists.connection) {
					return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'Usergroup already has that Permission.'}));
				} else {
					return resolve(ejs.renderFile('../views/templates/alert/std/warning.ejs', {message: 'That Usergroup and Permission exist and were not connected, but the server returned a failure state for an unknown reason.'}));
				}
			} else if(!exists.group && !exists.perm) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A Usergroup and Permission with those IDs could not be found.'}));
			} else if(!exists.group) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A Usergroup with that ID could not be found.'}));
			} else if(!exists.perm) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A Permission with that ID could not be found.'}));
			}
		}
	});
	res.status(200).json({'result': result, 'exist_data': exists, 'response': htmlResponse});
})

app.delete('/admin/manage/usergroup/perm', [], async function(req, res, next) {
	exists = {};
	exists.group = await db.exis.checkUsergroupExistsById(req.body.group_id).then(results => results.rows[0].case == 1);
	exists.perm = await db.exis.checkPermExistsById(req.body.perm_id).then(results => results.rows[0].case == 1);
	exists.connection = await db.exis.checkUsergroupHasPerm(req.body.group_id, req.body.perm_id).then(results => results.rows[0].case == 1);
	result = {'success': false};
	if(exists.group && exists.perm && exists.connection) {
		try {
			await db.connect.removePermFromUsergroup(req.body.group_id, req.body.perm_id);
			result = {'success': true};
		} catch(err) {
			console.log(err);
			result = await {'success': false, 'err': err.toString()};
		}
	}
	htmlResponse = await new Promise((resolve, reject) => {
		if(result.success) {
			return resolve(ejs.renderFile('../views/templates/alert/std/success.ejs', {message: 'Permission successfully removed from Usergroup.'}));
		} else {
			if(exists.group && exists.perm) {
				if(!exists.connection) {
					return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'Usergroup already lacks that Permission.'}));
				} else {
					return resolve(ejs.renderFile('../views/templates/alert/std/warning.ejs', {message: 'That Usergroup and Permission exist and were connected, but the server returned a failure state for an unknown reason.'}));
				}
			} else if(!exists.group && !exists.perm) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A Usergroup and Permission with those IDs could not be found.'}));
			} else if(!exists.group) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A Usergroup with that ID could not be found.'}));
			} else if(!exists.perm) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A Permission with that ID could not be found.'}));
			}
		}
	});
	res.status(200).json({'result': result, 'exist_data': exists, 'response': htmlResponse});
})

app.get('/admin/manage/user', [verify_signin, revalidate_login], function(req, res, next) {
	res.render('pages/admin/user-management');
});

app.post('/admin/manage/user/group', [], async function(req, res, next) {
	exists = {};
	exists.user = await db.exis.checkUserExistsById(req.body.user_id).then(results => results.rows[0].case == 1);
	exists.group = await db.exis.checkUsergroupExistsById(req.body.group_id).then(results => results.rows[0].case == 1);
	exists.connection = await db.exis.checkUserInGroup(req.body.user_id, req.body.group_id).then(results => results.rows[0].case == 1);
	result = {'success': false}
	if(exists.user && exists.group && !exists.connection) {
		try {
			await db.connect.addUserToGroup(req.body.user_id, req.body.group_id)
			result = {'success': true};
		} catch(err) {
			result = await {'success': false, 'err': err.toString()};
		}
	}
	htmlResponse = await new Promise((resolve, reject) => {
		if(result.success) {
			return resolve(ejs.renderFile('../views/templates/alert/std/success.ejs', {message: 'User Successfully Added to Group.'}));
		} else {
			if(exists.user && exists.group) {
				if(exists.connection) {
					return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'User is already a member.'}));
				} else {
					return resolve(ejs.renderFile('../views/templates/alert/std/warning.ejs', {message: 'That User and Usergroup exist and were not connected, but the server returned a failure state for an unknown reason.'}));
				}
			} else if(!exists.user && !exists.group) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A User and Usergroup with those IDs could not be found.'}));
			} else if(!exists.user) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A User with that ID could not be found.'}));
			} else if(!exists.group) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A Usergroup with that ID could not be found.'}));
			}
		}
	});
	res.status(200).json({'result': result, 'exist_data': exists, 'response': htmlResponse});
})

app.delete('/admin/manage/user/group', [], async function(req, res, next) {
	exists = {};
	exists.user = await db.exis.checkUserExistsById(req.body.user_id).then(results => results.rows[0].case == 1);
	console.log(exists.user);
	exists.group = await db.exis.checkUsergroupExistsById(req.body.group_id).then(results => results.rows[0].case == 1);
	console.log(exists.group);
	exists.connection = await db.exis.checkUserInGroup(req.body.user_id, req.body.group_id).then(results => results.rows[0].case == 1);
	result = {'success': false}
	if(exists.user && exists.group && exists.connection) {
		try {
			await db.connect.removeUserFromGroup(req.body.user_id, req.body.group_id)
			result = {'success': true};
		} catch(err) {
			result = await {'success': false, 'err': err.toString()};
		}
	}
	htmlResponse = await new Promise((resolve, reject) => {
		if(result.success) {
			return resolve(ejs.renderFile('../views/templates/alert/std/success.ejs', {message: 'User Successfully Removed from Group.'}));
		} else {
			if(exists.user && exists.group) {
				if(!exists.connection) {
					return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'User is already not  a member.'}));
				} else {
					return resolve(ejs.renderFile('../views/templates/alert/std/warning.ejs', {message: 'That User and Usergroup exist and were connected, but the server returned a failure state for an unknown reason.'}));
				}
			} else if(!exists.user && !exists.group) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A User and Usergroup with those IDs could not be found.'}));
			} else if(!exists.user) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A User with that ID could not be found.'}));
			} else if(!exists.group) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A Usergroup with that ID could not be found.'}));
			}
		}
	});
	res.status(200).json({'result': result, 'exist_data': exists, 'response': htmlResponse});
})

app.post('/admin/manage/user/perm', [], async function(req, res, next) {
	exists = {};
	exists.user = await db.exis.checkUserExistsById(req.body.user_id).then(results => results.rows[0].case == 1);
	exists.perm = await db.exis.checkPermExistsById(req.body.perm_id).then(results => results.rows[0].case == 1);
	exists.connection = await db.exis.checkUserHasPerm(req.body.user_id, req.body.perm_id).then(results => results.rows[0].case == 1);
	result = {'success': false}
	if(exists.user && exists.perm && !exists.connection) {
		try {
			await db.connect.givePermToUser(req.body.user_id, req.body.perm_id)
			result = {'success': true};
		} catch(err) {
			console.log(err);
			result = await {'success': false, 'err': err.toString()};
		}
	}
	htmlResponse = await new Promise((resolve, reject) => {
		if(result.success) {
			return resolve(ejs.renderFile('../views/templates/alert/std/success.ejs', {message: 'Permission successfully given to User.'}));
		} else {
			if(exists.user && exists.perm) {
				if(exists.connection) {
					return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'User already has that Permission.'}));
				} else {
					return resolve(ejs.renderFile('../views/templates/alert/std/warning.ejs', {message: 'That User and permission exist and were not connected, but the server returned a failure state for an unknown reason.'}));
				}
			} else if(!exists.user && !exists.perm) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A User and permission with those IDs could not be found.'}));
			} else if(!exists.user) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A User with that ID could not be found.'}));
			} else if(!exists.perm) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A permission with that ID could not be found.'}));
			}
		}
	});
	res.status(200).json({'result': result, 'exist_data': exists, 'response': htmlResponse});
})

app.delete('/admin/manage/user/perm', [], async function(req, res, next) {
	exists = {};
	exists.user = await db.exis.checkUserExistsById(req.body.user_id).then(results => results.rows[0].case == 1);
	console.log(exists.user);
	exists.perm = await db.exis.checkPermExistsById(req.body.perm_id).then(results => results.rows[0].case == 1);
	console.log(exists.perm);
	exists.connection = await db.exis.checkUserHasPerm(req.body.user_id, req.body.perm_id).then(results => results.rows[0].case == 1);
	result = {'success': false}
	if(exists.user && exists.perm && exists.connection) {
		try {
			await db.connect.removePermFromUser(req.body.user_id, req.body.perm_id)
			result = {'success': true};
		} catch(err) {
			result = await {'success': false, 'err': err.toString()};
		}
	}
	htmlResponse = await new Promise((resolve, reject) => {
		if(result.success) {
			return resolve(ejs.renderFile('../views/templates/alert/std/success.ejs', {message: 'Permission successfully removed from User.'}));
		} else {
			if(exists.user && exists.user) {
				if(!exists.connection) {
					return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'User already lacks that Permission.'}));
				} else {
					return resolve(ejs.renderFile('../views/templates/alert/std/warning.ejs', {message: 'That User and Permission exist and were connected, but the server returned a failure state for an unknown reason.'}));
				}
			} else if(!exists.user && !exists.perm) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A User and Permission with those IDs could not be found.'}));
			} else if(!exists.user) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A User with that ID could not be found.'}));
			} else if(!exists.perm) {
				return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'A Permission with that ID could not be found.'}));
			}
		}
	});
	res.status(200).json({'result': result, 'exist_data': exists, 'response': htmlResponse});
})

/*
app.get('/admin', [revalidate_login], function(req, res){
	//fetch('http://localhost:3000/api/tickets').then(qres => qres.json()).then(qres => res.render('pages/adminhome', {tickets: qres}));
});


app.get('/admin/tickets', [revalidate_login], async function(req, res){
	var x = await fetch('http://localhost:3000/api/tickets');
	var y = await fetch('http://localhost:3000/api/users');

	x = await x.json();
	y = await y.json();

	// console.log(x);
	// await console.log(y);

	res.render('pages/adminhome', {tickets: x, users: y})
});

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
