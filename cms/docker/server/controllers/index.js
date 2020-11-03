const port = 3000;
const def_blogs_per_page = 3;
var express = require('express');
var ejs = require('ejs');
var app = express();
var api = require('./api/api.js');
var fetch = require('node-fetch');
var cookieParser = require('cookie-parser');
const paseto = require('paseto');
const plman = require('./auth/payloadmanager.js');
const {V2} = paseto;

(async () => {
	const key = await V2.generateKey('local')
	app.set('key', key);
})()

console.log(V2);

app.set('views', '../views')
app.set('view engine','ejs');


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
	console.log(req.cookies);
	next();
}

async function revalidate_login(req, res, next) {
	const token = req.cookies.token
	if(token === undefined) {
		next();
	} else {
		var key = await app.get('key');
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
		next();
	}
}

//app.use('/auth', auth.router);

app.use(cookieParser());

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
		var data = await fetch('http://localhost:3000/api/users/1');
		var key = await app.get('key');
		console.log(plman.tokenize(data, key));
		x = await plman.construct("benglish4@gulls.salisbury.edu", "login_auth", 1440, []);
		console.log(x);
	})()
	
});

// TODO: Create a router for middleware separation
app.get('/auth', async function(req, res) {

	const token = req.cookies.token
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
			return; // Is this return necessary? Not sure if res.redirect ends code execution for a function (-Alex)
		}
		//res.cookie('token', token).set('cookie set');
		res.cookie('banner','auth/user_login/success_default');
		res.redirect('/');
	}
});


app.get('/b', [revalidate_login], function(req, res) {
	res.redirect('/blogs');
});
app.get('/blogs', [revalidate_login], function(req, res){
	//this for blog gen from db
	fetch('http://localhost:3000/api/blogs').then(qres => qres.json()).then(qres => res.render('pages/bloghome', {blogs: qres}));
	//res.render('pages/newbloghome');
});

app.get('/blogs/:bg', [revalidate_login], function(req, res) {
	res.redirect('/b/' + req.params.bg);
});

app.get('/b/:bg', [revalidate_login], async function (req, res) {
	p = parseInt(req.query.page)
	if(isNaN(p)) {
		p = 0;
	}
	origin = parseInt(req.query.origin)
	if(isNaN(origin)) {
		origin = (p*def_blogs_per_page)
	}
	
	group = req.params.bg;
	group_id = await fetch('http://localhost:3000/api/groups/blog/' + group).then(qres => qres.json()).then(qres => parseInt(qres["id"]))
	
	total = await fetch('http://localhost:3000/api/count/blogs/' + group_id + "/0").then(qres => qres.json()).then(qres => parseInt(qres["count"]));
	
	console.log("group: " + group + "\ngroup id: " + group_id + "\ncount: " + total + "\norigin: " + origin);
	fetch('http://localhost:3000/api/blogs/'+group_id+'/'+origin).then(qres => qres.json()).then(qres => res.render("pages/bloghome", {blogs: qres}));
});

/*app.get('/b/:bg', function(req, res) {
	p = parseInt(req.query.page);
	if(isNaN(p)) {
		res.redirect('/b/' + req.params.bg);
	}
}*/


app.get('/tt', function(req, res, next) {
	(async () => {
		var data = await fetch('http://localhost:3000/api/users/1').then(qres => qres.json());
		var key = await app.get('key');
		x = await plman.tokenize(plman.construct("benglish4@gulls.salisbury.edu", "login_auth", 1440, []),key);
		console.log(x);
		res.cookie('token', x).set('cookie set');
		res.redirect('/auth');
	})()
});

app.get('/tt2', function(req, res, next) {
	(async () => {
		var data = await fetch('http://localhost:3000/api/users/1').then(qres => qres.json());
		var key = await app.get('key');
		x = "badtokentest"
		console.log(x);
		res.cookie('token', x).set('cookie set');
		res.redirect('/auth');
	})()
});

app.get('/cc', function(req, res) {
	res.clearCookie('token');
	res.render('pages/home');
});


app.get('/tickets', [revalidate_login], function(req, res) {
	fetch('http://localhost:3000/api/tickets').then(qres => qres.json()).then(qres => res.render('pages/ticketlist', {tickets: qres}));

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
			return; // Is this return necessary? Not sure if res.redirect ends code execution for a function (-Alex)
	}
	email = payload.email;
	email_query = await fetch('http://localhost:3000/api/user/email/' + email).then(qres => qres.json());
	id = email_query.id;
	fetch('http://10.0.0.233:3000/api/tickets/user/' + 1).then(qres => qres.json()).then(qres => res.render('pages/tickets/mytickets', {tickets: qres}));
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
			return; // Is this return necessary? Not sure if res.redirect ends code execution for a function (-Alex)
	}
	email = payload.email;
	email_query = await fetch('http://localhost:3000/api/user/email/' + email).then(qres => qres.json());
	id = email_query.id;
	ticket_query = await fetch('http://10.0.0.233:3000/api/ticket/' + req.params.id).then(qres => qres.json());
	console.log(ticket_query);
	if(id != ticket_query.creator) {
		res.cookie('banner','error/unauthorized').set('cookie set');
		res.redirect('/mytickets');
	} else {
		res.render('pages/tickets/singleticket', {ticket: ticket_query});
	}
});

app.get('/admin/ticket/:categoryName', [revalidate_login], function(req, res){

	var tickets = [
		//API here for retrieving tickets by category
	];
	
	res.render("ticketCategory", {tickets:tickets});

});
	

//TODO: API for retrieving blog by category
//-----------------------------------------
// app.get('/blog/:categoryName/:blogId', function (req, res){
// 	var categoryName = req.params.categoryName;
// 	var blogId = req.params.blogId;

// 	res.render("singleBlog", {category: categoryName, blog: blogId});
// 	console.log("sent successfully");
// });

app.get('/admin', [revalidate_login], function(req, res){
	fetch('http://localhost:3000/api/tickets').then(qres => qres.json()).then(qres => res.render('pages/adminhome', {tickets: qres}));
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

app.get('/admin/tickets/:id', [revalidate_login], function(req, res){
	id = req.params.id;
	console.log(id);
	fetch('http://localhost:3000/api/ticket/' + id).then(qres => qres.json()).then(qres => res.render('pages/ticketadmin', {ticket: qres}));
});

// app.get('/ticket/create', function(req, res){
// 	fetch('http://localhost:3000/api/tickets').then(qres => qres.json()).then(qres => res.render('pages/ticketadmin', {tickets: qres}));
// });

app.get('/admin/users/:id', [revalidate_login], function(req, res){
	id = req.params.id;
	console.log(id);
	fetch('http://localhost:3000/api/users/'+ id).then(qres => qres.json()).then(qres => res.render('pages/userdisplay', {user: qres}));
});


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
