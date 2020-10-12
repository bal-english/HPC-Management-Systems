const port = 3000;
const def_blogs_per_page = 3;
var express = require('express');
var app = express();
var api = require('./api/api.js');
var fetch = require('node-fetch');

app.set('views', '../views')
app.set('view engine','ejs');

app.use('/api', api.router/*, function (req, res) {
	res.sendStatus(401);
}*/);

app.get('/', function(req, res) {
	res.render('pages/home');
});

app.get('/tickets', function(req, res) {
	fetch('http://localhost:3000/api/tickets').then(qres => qres.json()).then(qres => res.render('pages/ticketlist', {tickets: qres}));

});

app.get('/admin/ticket/:categoryName', function(req, res){

	var tickets = [
		//API here for retrieving tickets by category
	];
	
	res.render("ticketCategory", {tickets:tickets});

});

app.get('/b', function(req, res) {
	res.redirect('/blogs');
});
app.get('/blogs', function(req, res){
	//this for blog gen from db
	fetch('http://localhost:3000/api/blogs').then(qres => qres.json()).then(qres => res.render('pages/bloghome', {blogs: qres}));
	//res.render('pages/newbloghome');
});

app.get('/blogs/:bg', function(req, res) {
	res.redirect('/b/' + req.params.bg);
});

app.get('/b/:bg', async function (req, res) {
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
	

//TODO: API for retrieving blog by category
//-----------------------------------------
// app.get('/blog/:categoryName/:blogId', function (req, res){
// 	var categoryName = req.params.categoryName;
// 	var blogId = req.params.blogId;

// 	res.render("singleBlog", {category: categoryName, blog: blogId});
// 	console.log("sent successfully");
// });

app.get('/admin', function(req, res){
	fetch('http://localhost:3000/api/tickets').then(qres => qres.json()).then(qres => res.render('pages/adminhome', {tickets: qres}));
});

app.get('/admin/tickets', async function(req, res){
	var x = await fetch('http://localhost:3000/api/tickets');
	var y = await fetch('http://localhost:3000/api/users');

	x = await x.json();
	y = await y.json();

	// console.log(x);
	// await console.log(y);

	res.render('pages/adminhome', {tickets: x, users: y})
});

app.get('/admin/tickets/:id', function(req, res){
	id = req.params.id;
	console.log(id);
	fetch('http://localhost:3000/api/ticket/' + id).then(qres => qres.json()).then(qres => res.render('pages/ticketadmin', {ticket: qres}));
});

// app.get('/ticket/create', function(req, res){
// 	fetch('http://localhost:3000/api/tickets').then(qres => qres.json()).then(qres => res.render('pages/ticketadmin', {tickets: qres}));
// });

app.get('/admin/users/:id', function(req, res){
	id = req.params.id;
	console.log(id);
	fetch('http://localhost:3000/api/users/'+ id).then(qres => qres.json()).then(qres => res.render('pages/userdisplay', {user: qres}));
});



//********dynamic routing*********

// ````````````EXAMPLES: 

		//Main example for loading a page dynamically:
			// app.get('/:id', function(req, res){
			//    res.send('The id you specified is ' + req.params.id);
			// });

		//Route parameters are named URL segments that are used to capture the values specified at their position in the URL. 
		//The captured values are populated in the req.params object, with the name of the route parameter specified in the path as their respective keys.

			// Route path: /users/:userId/books/:bookId
			// Request URL: http://localhost:3000/users/34/books/8989
			// req.params: { "userId": "34", "bookId": "8989" }

		// To define routes with route parameters, simply specify the route parameters in the path of the route as shown below.

			// app.get('/users/:userId/books/:bookId', function (req, res) {
			//   res.send(req.params)
			// })

		//To have more control over the exact string that can be matched by a route parameter, you can append a regular expression in parentheses (()):

			// Route path: /user/:userId(\d+)
			// Request URL: http://localhost:3000/user/42
			// req.params: {"userId": "42"}

// ````````````



	//**** BLOG GROUPING ****

	// //any page the user searches for manually in URL with "blog" literal will show main page (for now)
	// app.get(/blog/, function (req, res) {
 //  		res.sendFile(path.join(__dirname + '/views/bloghome.html'));
	// });

		//id can only be 5 digits from 0-9
		//for blog posts
		//Should connect to Postgres & return data
	// app.get('/blog/:id([0-9]{5})', function(req, res){
	//    res.send("TODO: Blog individual page goes here");
	//    res.send('id: ' + req.params.id);
	// });



//**** TICKET GROUPING ****

	// 	//id can only be 5 digits from 0-9
	// 	//for tickets
	// 	//Should connect to Postgres & return data
	// app.get('/ticket/:id([0-9]{5})', function(req, res){
	//    res.send("TODO: Ticket individual page goes here");
	//    res.send('id: ' + req.params.id);
	// });


//***** OTHER ROUTES *****

	/*app.get('*', function(req, res){
	   res.sendFile(path.join(__dirname + '/views/error.html'));
	});
*/




app.listen(port, () => {
	console.log(`App running on port ${port}`);
});
