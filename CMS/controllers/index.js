const port = 35000;
var express = require('express');
var app = express();
var api = require('api/api.js');

app.set('view engine','ejs');

app.use('/api', api);

app.get('/', function(req, res) {
	res.render('pages/home');
});

app.get('/tickets', function(req, res) {
	list = [{id: 7, creator: 0, title: "This is a test title for tickets"},{id: 8, creator: 1, title: "This is a second test title for tickets"}];
	res.render('pages/ticketlist', {tickets: list});
});

// app.get('/blog', function(req, res){
// 	res.render('views/bloghome');
// });

// app.get('/admin', function(req, res){
// 	res.render('views/admin');
// 	});


// app.get('/ticket/create', function(req, res){
// 	res.render('views/ticketcreate');
// });



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
