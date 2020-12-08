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

async function validateBanner(req, res, next) {
	try {
		ejs.render('templates/alert/' + req.cookies.banner)
	} catch(err) {
		res.locals.banner = 'auth/failure_default';
		next();
	}
	res.locals.banner = req.cookies.banner;
	next();
}
async function clearBanner(req, res, next) {
	await console.log('This function (clearBanner) is deprecated, please update it.')
	res.cookie('banner', 'none').set('cookie set');
	//console.log(req.cookies);
	next();
}
async function verify_signin(req, res, next) {
	await console.log('This function (verify_signin) is deprecated, please update it.')
	const token = req.cookies.token;
	if(token === undefined) {
		res.cookie('banner', 'auth/signin_required').set('cookie set');
		res.redirect('/');
	} else {
		next();
	}
}
async function revalidate_login(req, res, next) {
	await console.log('This function (revalidate_login) is deprecated, please update it.')
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
};

function internal_prep(req, res, next) {
	console.log(req.cookies);
	if(req.internal === undefined) {
		req.internal = {'problem': {}, 'banner': 'none', 'require': {'signin': false}, 'user': {'authed': false}};
		res.locals.user = req.internal.user;
	};
	next();
};

function enable_signin_required(req, res, next) {
	req.internal.require.signin = true;
	next();
}

async function validate_signin(req, res, next) {
	req.internal.problem.no_token = await false;
	req.internal.problem.invalid_token = await false;
	req.internal.problem.bad_email = await false;
	req.internal.problem.bad_nonce = await false;
	req.internal.problem.cannot_check_nonce = await false;

	const token = req.cookies.token;
	req.internal.problem.no_token = await new Promise((resolve, reject) => {
		if(token === undefined && req.internal.require.signin) {
			resolve(true);
		} else {
			resolve(false);
		}
	});
	req.internal.problem.invalid_token = await new Promise(async (resolve, reject) => {
		if(req.internal.problem.no_token == true || token === undefined) {
			resolve(undefined);
		} else {
			const key = await app.get('key');
			try {
				req.internal.user.payload = await plman.validate(token, key);
				resolve(false);
			} catch(err) {
				console.log(err);
				resolve(true);
			}
		}
	});
	req.internal.problem.bad_email = await new Promise(async (resolve, reject) => {
		if(req.internal.problem.invalid_token === undefined || req.internal.problem.invalid_token == true) {
			resolve(undefined);
		} else {
			try {
				req.internal.user.id = await db.convert.user.emailToId(req.internal.user.payload.email).then(results => results.rows[0].id);
				resolve(false);
			} catch(err) {
				console.log("hello");
				console.log(err);
				resolve(true)
			}
		}
	})
	req.internal.problem.cannot_check_nonce = await new Promise(async (resolve, reject) => {
		if(req.internal.problem.bad_email === undefined) {
			resolve(undefined);
			req.internal.problem.bad_nonce = undefined;
		} else {
			try {
				req.internal.problem.bad_nonce = !(await plman.nonceCheck(req.internal.user.id, req.internal.user.payload.lastNonce));
				if(req.internal.problem.bad_nonce != true && req.internal.problem.bad_nonce != false) {
					throw 'ERR: Failure in nonce check.';
				}
				resolve(false);
			} catch(err) {
				console.log(err);
				req.internal.problem.bad_nonce = undefined;
				resolve(true);
			}
		}
	})
	req.internal.problem.any = () => {
		for(key in req.internal.problem) {
			if(key != "any" && (req.internal.problem[key] == true || req.internal.problem[key] === undefined)) {
				return true;
			}
		}
		return false;
	}
	if(req.internal.problem.any() == false) {
		req.internal.user.authed = true;
	}
	res.locals.user = req.internal.user;
	res.locals.authed = req.internal.user.authed;
	console.log(await req.internal.problem);
	next();
}

async function process_banner(req, res, next) {
	console.log(req.cookies.banner);
	if((req.internal.banner == 'none' || req.internal.banner === undefined) && req.cookies.banner != 'none') {
		req.internal.banner = req.cookies.banner;
	}
	try {
		ejs.render('templates/alert/' + req.internal.banner)
	} catch(err) {
		req.internal.problem.invalid_banner = true;
		req.internal.banner = 'auth/failure_default';
	}
	res.locals.banner = req.internal.banner;
	console.log(res.locals.banner);
	req.internal.banner = 'none';
	res.cookie('banner', 'none').set('cookie set');
	next();
}
function log_problems(req, res, next) {
	console.log(req.internal.problem);
	next();
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

app.use(cookieParser());
app.use(bodyParser.json());

/*
app.use('/', function(req, res, next) {
	console.log(req.cookies);
	next();
});
*/

app.locals.banner = 'none';//"auth/user_signin/success_default";
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
async function send_signin_auth(to, token) {
	return send_email(from_email, to, 'SU HPCL: Signin Authorization', 'localhost:3000/auth?token=' + token + '\n10.0.0.233:3000/auth?token=' + token).catch(async (err) => {
		throw err;
	});
}
async function send_reg_auth(to, token) {
	return send_email(from_email, to, 'SU HPCL: Account Registration', 'localhost:3000/auth?token=' + token + '\n10.0.0.233:3000/auth?token=' + token).catch(async (err) => {
		throw err;
	});
}

// TODO: Create a router for middleware separation
app.get('/auth', [internal_prep], async function(req, res, next) {
	if(req.query.token === undefined) {
		if(req.cookies.token === undefined) {
			res.cookie('banner', 'auth/user_signin/failure_default');
		}
		res.redirect('/');
		return;
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

app.get('/login', function(req, res) {
	res.redirect('/signin')
})
app.get('/signin', [internal_prep, process_banner], function(req, res){
 	res.render('pages/user_accounts/signin');
});

app.post('/signin', async function(req, res){
	key = await app.get('key');
	return db.datareq.getUserByEmail(req.body.email).then(results => {
		if(results.rowCount == 0) {
			return new Promise((resolve, reject) => {
				resolve(res.cookie('banner', 'mail/signin/failure_noaccount'));
			}).then(newres => newres.status(200).json({'redirect': true, 'url': '/signin'}));
		} else {
			return new Promise((resolve, reject) => {
				resolve(plman.construct('signin_auth', req.body.email, results.rows[0].nonce))
			}).then(payload => plman.tokenize(payload, key)).then(token => {
				return new Promise(async (resolve, reject) => {
					try {
						await send_signin_auth(req.body.email, token);
						resolve(res.cookie('banner', 'mail/signin/success_default'));
					} catch(err) {
						reject(err);
					}
				}).catch((result) => {
					return res.cookie('banner', 'mail/signin/failure_default');
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
	console.log(req.query);
	next();
}

app.get('/profile', [internal_prep, enable_signin_required, validate_signin, function(req, res, next) {
		if(req.internal.problem.no_token == true) {
			req.internal.banner = 'auth/signin_required'
			res.clearCookie('token');
		} else if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
			req.internal.banner = 'auth/invalid_default'
			res.clearCookie('token');
		} else if(req.internal.problem.cannot_check_nonce) {
			req.internal.banner = 'auth/invalid_default'
			res.clearCookie('token');
		} else if(req.internal.problem.bad_nonce) {
			req.internal.banner = 'auth/invalid_nonce'
			res.clearCookie('token');
		}
		if(req.internal.problem.any() == true) {
			res.cookie('banner', req.internal.banner).set('cookie set');
			res.redirect('/');
		} else {
			next();
		}
}, profile_pagination_check, process_banner], async function(req, res) {
	const user_id = parseInt(req.internal.user.id);
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
	res.render('pages/user_accounts/profile', {blogs: blog_data, tickets: ticket_data})
});

app.post('/profile/reset', [internal_prep, enable_signin_required, validate_signin, function(req, res, next) {
	if(req.internal.problem.no_token == true) {
		req.internal.banner = 'auth/signin_required'
		res.clearCookie('token');
	} else if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.cannot_check_nonce) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.bad_nonce) {
		req.internal.banner = 'auth/invalid_nonce'
		res.clearCookie('token');
	}
	if(req.internal.problem.any() == true) {
		res.cookie('banner', req.internal.banner).set('cookie set');
		return res.status(400).json({'redirect': true, 'url': '/'});
	} else {
		next();
	}
}],async function(req, res, next) {
	return await db.update.user.nonce(req.internal.user.id).then(results => results.rowCount).then(async (rowCount) => {
		if(rowCount == 0) {
			return new Promise((resolve, reject) => {
				resolve(res.cookie('banner', 'auth/failure_default'));
			}).then(newres => newres.status(400).json({'redirect': true, 'url': '/'}));
		} else {
			return new Promise((resolve, reject) => {
				resolve(res.clearCookie('token'));
			}).then(newres => newres.cookie('banner', 'auth/user_signout/success_all')).then(newres => newres.status(200).json({'redirect': true, 'url': '/'}));
		}
	})
});

app.get('/signout', [internal_prep, enable_signin_required, validate_signin, async function(req, res, next) {
	if(req.internal.problem.any() == true) {
		res.redirect('/');
	} else {
		next();
	}
}], function(req, res,) {
	res.render('pages/user_accounts/signout');
})

app.get('/register', [internal_prep, validate_signin, process_banner], function(req, res){
	res.render('pages/user_accounts/register');
});

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

app.get('/blog/create', [internal_prep, enable_signin_required, validate_signin, function(req, res, next) {
	if(req.internal.problem.no_token == true) {
		req.internal.banner = 'auth/signin_required';
	} else if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.cannot_check_nonce) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.bad_nonce) {
		req.internal.banner = 'auth/invalid_nonce'
		res.clearCookie('token');
	}
	if(req.internal.problem.any() == true) {
		res.cookie('banner', req.internal.banner).set('cookie set');
		res.redirect('/');
	} else {
		next();
	}
}, process_banner], async function(req, res) {
	const payload = req.internal.user.payload;
	if((await plman.authorityCheck(payload, "content.create")) == true) {
			res.render('pages/createblog');
	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.redirect('/');
	}
});

app.post('/blog/create', [internal_prep, enable_signin_required, validate_signin, function(req, res, next) {
	if(req.internal.problem.no_token == true) {
		req.internal.banner = 'auth/signin_required';
	} else if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.cannot_check_nonce) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.bad_nonce) {
		req.internal.banner = 'auth/invalid_nonce'
		res.clearCookie('token');
	}
	if(req.internal.problem.any() == true) {
		res.cookie('banner', req.internal.banner).set('cookie set');
		return res.status(400).json({'redirect': true, 'url': '/'});
	} else {
		next();
	}
}], async function(req, res){
	const payload = req.internal.user.payload;
	if((await plman.authorityCheck(payload, "content.create")) == true) {
			var user_id = req.internal.user.id
			var title = req.body.title;
			var body = req.body.blog_content;
			var group = 0;

			console.log(req.body.title);
			console.log(req.body.blog_content);

			return db.create.blog(title, user_id, group, body).then(results => results.rows[0].id).then(b_id => '/blog/' + b_id).then(newurl => res.status(200).json({'redirect': true, 'url': newurl}))
	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.status(200).json({'redirect': true, 'url': '/'})
	}
});

app.get('/blog/:id([0-9]+)', [internal_prep, validate_signin, function(req, res, next) {
	if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.cannot_check_nonce) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.bad_nonce) {
		req.internal.banner = 'auth/invalid_nonce'
		res.clearCookie('token');
	}
	next();
}, process_banner], function(req, res) {
	db.datareq.getBlogById(parseInt(req.params.id)).then(results => results.rows[0]).then(qres => res.render('pages/blogs/singleblog', {blog: qres}));
});

app.get('/blogs', [internal_prep, validate_signin, function(req, res, next) {
	if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.cannot_check_nonce) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.bad_nonce) {
		req.internal.banner = 'auth/invalid_nonce'
		res.clearCookie('token');
	}
	next();
}, process_banner, blog_pagination_check], async function(req, res) {
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
})

app.get('/rtt', function(req, res, next) {
	(async () => {
		var key = await app.get('key');
		x = await plman.tokenize(plman.construct("reg_auth", "maps@inkwright.net"), key);
		res.redirect('/auth?token=' + (await x));
	})()
});

;

app.get('/tt', function(req, res, next) {
	(async () => {
		var data = await db.datareq.getUserById(1).then(results => results.rows[0]);
		var key = await app.get('key');
		x = await plman.tokenize(plman.construct("signin_auth", "benglish4@gulls.salisbury.edu", data.nonce), key);
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
		x = x = await plman.tokenize(plman.construct("signin_auth", "rcquackenbush@salisbury.edu", data.nonce), key);
		res.cookie('token', x).set('cookie set');
		res.redirect('auth');
	})()
});

app.get('/cc', function(req, res) {
	res.clearCookie('token');
	res.render('pages/home');
});

app.get('/ticket/create', [internal_prep, enable_signin_required, validate_signin, function(req, res, next) {
		if(req.internal.problem.no_token) {
			req.internal.banner = 'auth/signin_required'
			res.clearCookie('token');
		} else if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
			req.internal.banner = 'auth/invalid_default'
			res.clearCookie('token');
		} else if(req.internal.problem.cannot_check_nonce) {
			req.internal.banner = 'auth/invalid_default'
			res.clearCookie('token');
		} else if(req.internal.problem.bad_nonce) {
			req.internal.banner = 'auth/invalid_nonce'
			res.clearCookie('token');
		}
		if(req.internal.problem.any() == true) {
			res.cookie('banner', req.internal.banner).set('cookie set');
			res.redirect('/');
		} else {
			next();
		}
}, process_banner], async function(req, res) {
	const payload = req.internal.user.payload;
	if((await plman.authorityCheck(payload, "ticket.create")) == true) {
		res.render('pages/ticketcreation');
	} else {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.redirect('/');
	}
});

app.post('/ticket/create', [internal_prep, enable_signin_required, validate_signin, function(req, res, next) {
	if(req.internal.problem.no_token == true) {
		req.internal.banner = 'auth/signin_required';
	} else if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.cannot_check_nonce) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.bad_nonce) {
		req.internal.banner = 'auth/invalid_nonce'
		res.clearCookie('token');
	}
	if(req.internal.problem.any() == true) {
		res.cookie('banner', req.internal.banner).set('cookie set');
		return res.status(400).json({'redirect': true, 'url': '/'});
	} else {
		next();
	}
}], async function(req, res){
	const payload = req.internal.user.payload;
	if((await plman.authorityCheck(payload, "ticket.create")) == true) {
		var user_id = req.internal.user.id

		var ticket_title = req.body.title;
		var ticket_body = req.body.ticket_info;
		console.log(ticket_title);
		console.log(ticket_body);

		return db.create.ticket(user_id, ticket_title, ticket_body).then(results => results.rows[0].id).then(t_id => '/ticket/' + t_id).then(newurl => res.status(200).json({'redirect': true, 'url': newurl}))
	} else {
			res.cookie('banner','error/unauthorized_view').set('cookie set');
			res.status(200).json({'redirect': true, 'url': '/'})
	}
});

app.get('/ticket/:id([0-9]+)', [internal_prep, enable_signin_required, validate_signin, function(req, res, next) {
	if(req.internal.problem.no_token) {
		req.internal.banner = 'auth/signin_required'
		res.clearCookie('token');
	} else if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.cannot_check_nonce) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.bad_nonce) {
		req.internal.banner = 'auth/invalid_nonce'
		res.clearCookie('token');
	}
	if(req.internal.problem.any() == true) {
		res.cookie('banner', req.internal.banner).set('cookie set');
		res.redirect('/');
	} else {
		next();
	}
}, process_banner], async function(req, res) {

	const ticket_id = await parseInt(req.params.id);

	ticket_query = await db.datareq.getTicketById(ticket_id).then(results => results.rows[0]);

	user_id = parseInt(req.internal.user.id);

		// TODO: parse ticket_assignee for each assigned admin, pulling each admin's information to post to page ?

	ticket_assignee = await db.datareq.getAssignedByTicket(ticket_id).then(results => results.rows); //return "parsed" json array?
	if (isNaN(ticket_assignee)){
		db.update.ticketAssigned(1, ticket_query);
	}

	console.log("----------ticket_assignee-------------");
	console.log(ticket_assignee); //should be array of json objs, 1 if originally no one was assigned

	var assigned = {};
	ticket_assignee.forEach(assignee => { assigned_admin.push(assigned) } );

	console.log("----------assgined admin as json objects-------------");
	console.log("These are the assigned admins: " + assigned);


	ticket_creator = await db.datareq.getCreatorOfTicket(ticket_id).then(results => parseInt(results.rows[0].creator)).then(id => db.datareq.getUserInfoById(id)).then(results => results.rows[0]);//db.datareq.getUserById(user_id).then(results => results.rows[0]) // this returns user's information to post ot page
	console.log("----------ticket creator json obj--------------------");
	console.log(ticket_creator);

	admin_check = await ((await plman.authorityCheck(payload, "ticket.claim") == true) || (await plman.authorityCheck(payload, "ticket.assign") == true) || (await plman.authorityCheck(payload, "ticket.process.others") == true));

	if(user_id != ticket_query.creator && !admin_check) {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.redirect('/mytickets');
	}
	else {
		db.datareq.getPossibleTicketStatuses().then(results => results.rows[0].enum_range).then(stat_str => stat_str.substring(1, stat_str.length-1).split(',')).then(arr => res.render('pages/tickets/singleticket', {ticket: ticket_query, author: ticket_creator, assigned: assigned, admin: admin_check, statuses: arr}))
	}
});

app.post('/ticket/status', [internal_prep, enable_signin_required, validate_signin, function(req, res, next) {
		if(req.internal.problem.no_token == true) {
			req.internal.banner = 'auth/signin_required';
		} else if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
			req.internal.banner = 'auth/invalid_default'
			res.clearCookie('token');
		} else if(req.internal.problem.cannot_check_nonce) {
			req.internal.banner = 'auth/invalid_default'
			res.clearCookie('token');
		} else if(req.internal.problem.bad_nonce) {
			req.internal.banner = 'auth/invalid_nonce'
			res.clearCookie('token');
		}
		if(req.internal.problem.any() == true) {
			res.cookie('banner', req.internal.banner).set('cookie set');
			return res.status(400).json({'redirect': true, 'url': '/'});
		} else {
			next();
		}
}], async function(req, res) {
	console.log('hello');
	const payload = req.internal.user.payload;
	if((await plman.authorityCheck(payload, "ticket.claim") == true || plman.authorityCheck(payload, "ticket.assign") == true || plman.authorityCheck(payload, "ticket.process.others")) == true) {

		var ticket_status = await req.body.status;
		var ticket_id = await req.body.ticket_id;
		console.log(ticket_status);
		console.log(ticket_id);
		return db.update.ticketStatus(ticket_id, ticket_status).then(results => results.rows[0].id).then(id => '/ticket/' + id).then(route => res.status(200).json({'redirect': true, 'url': route}));
	} else {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.status(200).json({'redirect': true, 'url': '/'})
	}
});

/*
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
*/
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

app.get('/admin/manage/usergroup', [internal_prep, enable_signin_required, validate_signin, function(req, res, next) {
	if(req.internal.problem.no_token) {
		req.internal.banner = 'auth/signin_required'
		res.clearCookie('token');
	} else if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.cannot_check_nonce) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.bad_nonce) {
		req.internal.banner = 'auth/invalid_nonce'
		res.clearCookie('token');
	}
	if(req.internal.problem.any() == true) {
		res.cookie('banner', req.internal.banner).set('cookie set');
		res.redirect('/');
	} else {
		next();
	}
}, process_banner], async function(res, res, next) {
	if((await plman.authorityCheck(payload, "db.admin") == true)) {
		res.render('pages/admin/usergroup-management');
	} else {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.redirect('/');
	}
});


app.post('/admin/manage/usergroup/perm', [internal_prep, enable_signin_required, validate_signin, async function(req, res, next) {
	result = {'success': false, 'auth': false};
	if(req.internal.problem.any() == true) {
		banner_message = 'Your authorization could not be verified';
		if(req.internal.problem.no_token) {
			banner_message += ' (ERR: No Auth)';
		} else if(req.internal.problem.invalid_token == true) {
			banner_message += ' (ERR: Invalid Auth)';
		} else if(req.internal.problem.bad_email == true || req.internal.problem.cannot_check_nonce == true) {
			banner_message += ' (ERR: Bad Auth)';
		} else if(req.internal.problem.bad_nonce) {
			banner_message += ' (ERR: Bad Nonce)';
		} else {
			banner_message += ' (ERR: Unknown)';
		}
		htmlResponse = await new Promise((resolve, reject) => {
			return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: banner_message}))
		})
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else if((await plman.authorityCheck(payload, "db.admin") == false)) {
		htmlResponse = await ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'You do not have permission to do that action.'});
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else {
		next();
	}
}], async function(req, res, next) {
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
			result = await {'success': false, 'auth': true, 'err': err.toString()};
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

app.delete('/admin/manage/usergroup/perm', [internal_prep, enable_signin_required, validate_signin, async function(req, res, next) {
	result = {'success': false, 'auth': false};
	if(req.internal.problem.any() == true) {
		banner_message = 'Your authorization could not be verified';
		if(req.internal.problem.no_token) {
			banner_message += ' (ERR: No Auth)';
		} else if(req.internal.problem.invalid_token == true) {
			banner_message += ' (ERR: Invalid Auth)';
		} else if(req.internal.problem.bad_email == true || req.internal.problem.cannot_check_nonce == true) {
			banner_message += ' (ERR: Bad Auth)';
		} else if(req.internal.problem.bad_nonce) {
			banner_message += ' (ERR: Bad Nonce)';
		} else {
			banner_message += ' (ERR: Unknown)';
		}
		htmlResponse = await new Promise((resolve, reject) => {
			return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: banner_message}))
		})
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else if((await plman.authorityCheck(payload, "db.admin") == false)) {
		htmlResponse = await ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'You do not have permission to do that action.'});
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else {
		next();
	}
}], async function(req, res, next) {
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

app.get('/admin/manage/user', [internal_prep, enable_signin_required, validate_signin, function(req, res, next) {
	if(req.internal.problem.no_token) {
		req.internal.banner = 'auth/signin_required'
		res.clearCookie('token');
	} else if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.cannot_check_nonce) {
		req.internal.banner = 'auth/invalid_default'
		res.clearCookie('token');
	} else if(req.internal.problem.bad_nonce) {
		req.internal.banner = 'auth/invalid_nonce'
		res.clearCookie('token');
	}
	if(req.internal.problem.any() == true) {
		res.cookie('banner', req.internal.banner).set('cookie set');
		res.redirect('/');
	} else {
		next();
	}
}, process_banner], async function(res, res, next) {
	if((await plman.authorityCheck(payload, "db.admin") == true) || (await plman.authorityCheck(payload, "user.deactivate.others"))) {
		res.render('pages/admin/user-management');
	} else {
		res.cookie('banner','error/unauthorized_view').set('cookie set');
		res.redirect('/');
	}
});

app.post('/admin/manage/user/group', [internal_prep, enable_signin_required, validate_signin, async function(req, res, next) {
	result = {'success': false, 'auth': false};
	if(req.internal.problem.any() == true) {
		banner_message = 'Your authorization could not be verified';
		if(req.internal.problem.no_token) {
			banner_message += ' (ERR: No Auth)';
		} else if(req.internal.problem.invalid_token == true) {
			banner_message += ' (ERR: Invalid Auth)';
		} else if(req.internal.problem.bad_email == true || req.internal.problem.cannot_check_nonce == true) {
			banner_message += ' (ERR: Bad Auth)';
		} else if(req.internal.problem.bad_nonce) {
			banner_message += ' (ERR: Bad Nonce)';
		} else {
			banner_message += ' (ERR: Unknown)';
		}
		htmlResponse = await new Promise((resolve, reject) => {
			return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: banner_message}))
		})
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else if((await plman.authorityCheck(payload, "db.admin") == false) && (await plman.authorityCheck(payload, "user.deactivate.others") == false)) {
		htmlResponse = await ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'You do not have permission to do that action.'});
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else {
		next();
	}
}], async function(req, res, next) {
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

app.delete('/admin/manage/user/group', [internal_prep, enable_signin_required, validate_signin, async function(req, res, next) {
	result = {'success': false, 'auth': false};
	if(req.internal.problem.any() == true) {
		banner_message = 'Your authorization could not be verified';
		if(req.internal.problem.no_token) {
			banner_message += ' (ERR: No Auth)';
		} else if(req.internal.problem.invalid_token == true) {
			banner_message += ' (ERR: Invalid Auth)';
		} else if(req.internal.problem.bad_email == true || req.internal.problem.cannot_check_nonce == true) {
			banner_message += ' (ERR: Bad Auth)';
		} else if(req.internal.problem.bad_nonce) {
			banner_message += ' (ERR: Bad Nonce)';
		} else {
			banner_message += ' (ERR: Unknown)';
		}
		htmlResponse = await new Promise((resolve, reject) => {
			return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: banner_message}))
		})
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else if((await plman.authorityCheck(payload, "db.admin") == false) && (await plman.authorityCheck(payload, "user.deactivate.others") == false)) {
		htmlResponse = await ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'You do not have permission to do that action.'});
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else {
		next();
	}
}], async function(req, res, next) {
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

app.post('/admin/manage/user/perm', [internal_prep, enable_signin_required, validate_signin, async function(req, res, next) {
	result = {'success': false, 'auth': false};
	if(req.internal.problem.any() == true) {
		banner_message = 'Your authorization could not be verified';
		if(req.internal.problem.no_token) {
			banner_message += ' (ERR: No Auth)';
		} else if(req.internal.problem.invalid_token == true) {
			banner_message += ' (ERR: Invalid Auth)';
		} else if(req.internal.problem.bad_email == true || req.internal.problem.cannot_check_nonce == true) {
			banner_message += ' (ERR: Bad Auth)';
		} else if(req.internal.problem.bad_nonce) {
			banner_message += ' (ERR: Bad Nonce)';
		} else {
			banner_message += ' (ERR: Unknown)';
		}
		htmlResponse = await new Promise((resolve, reject) => {
			return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: banner_message}))
		})
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else if((await plman.authorityCheck(payload, "db.admin") == false) && (await plman.authorityCheck(payload, "user.deactivate.others") == false)) {
		htmlResponse = await ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'You do not have permission to do that action.'});
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else {
		next();
	}
}], async function(req, res, next) {
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

app.delete('/admin/manage/user/perm', [internal_prep, enable_signin_required, validate_signin, async function(req, res, next) {
	result = {'success': false, 'auth': false};
	if(req.internal.problem.any() == true) {
		banner_message = 'Your authorization could not be verified';
		if(req.internal.problem.no_token) {
			banner_message += ' (ERR: No Auth)';
		} else if(req.internal.problem.invalid_token == true) {
			banner_message += ' (ERR: Invalid Auth)';
		} else if(req.internal.problem.bad_email == true || req.internal.problem.cannot_check_nonce == true) {
			banner_message += ' (ERR: Bad Auth)';
		} else if(req.internal.problem.bad_nonce) {
			banner_message += ' (ERR: Bad Nonce)';
		} else {
			banner_message += ' (ERR: Unknown)';
		}
		htmlResponse = await new Promise((resolve, reject) => {
			return resolve(ejs.renderFile('../views/templates/alert/std/error.ejs', {message: banner_message}))
		})
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else if((await plman.authorityCheck(payload, "db.admin") == false) && (await plman.authorityCheck(payload, "user.deactivate.others") == false)) {
		htmlResponse = await ejs.renderFile('../views/templates/alert/std/error.ejs', {message: 'You do not have permission to do that action.'});
		res.status(200).json({'result': result, 'response': htmlResponse});
	} else {
		next();
	}
}], async function(req, res, next) {
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

app.get('/', [internal_prep, validate_signin, function(req, res, next) {
	if(req.query.signout == true || req.query.signout == 'true' || req.query.signout == 'True' || req.query.signout == 'TRUE') {
		if((req.internal.problem.no_token == true || req.internal.problem.invalid_token == true)) {
			req.internal.problem.cannot_signout = true;
			req.internal.banner = 'auth/user_signout/failure_notsignedin';
		} else {
			req.internal.problem.cannot_signout = false;
			req.internal.banner = 'auth/user_signout/success_default';
			req.internal.user.authed = false;
			res.locals.authed = req.internal.user.authed;
		}
		res.clearCookie('token');
	} else {
		if(req.internal.problem.invalid_token == true || req.internal.problem.bad_email == true) {
			req.internal.banner = 'auth/invalid_default'
			res.clearCookie('token');
		} else if(req.internal.problem.cannot_check_nonce) {
			req.internal.banner = 'auth/invalid_default'
			res.clearCookie('token');
		} else if(req.internal.problem.bad_nonce) {
			req.internal.banner = 'auth/invalid_nonce'
			res.clearCookie('token');
		}
	}
	next();
}, process_banner], function(req, res) {
	res.render('pages/home');
});

app.listen(port, () => {
	console.log(`App running on port ${port}`);
});
