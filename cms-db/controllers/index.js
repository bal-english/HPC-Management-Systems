	
	var express = require('express');
	var app = express();

	app.set('views','./views');
	var path = require('path');

	app.use(express.static('images'));
	app.use(express.static('dbconnect.js'));


		//path prefix for serving static files. For example, if you want to provide a path prefix like '/static'
		// app.use('/static', express.static('public'));
		// Now whenever you need to include a file, for example, 
		// a script file called main.js residing in your public directory, use the following script tag −

		// <script src = "/static/main.js" />

		//********This technique can come in handy when providing multiple directories as static files. 
		//		  These prefixes can help distinguish between multiple directories.

	app.get('/', function(req, res) {
    	res.sendFile(path.join(__dirname + '/views/home.html'));
	});

	app.get('/blog', function(req, res){
    	res.sendFile(path.join(__dirname + '/views/bloghome.html'));
	});

	app.get('/ticket', function(req, res){
    	res.sendFile(path.join(__dirname + '/views/tickethome.html'));
	});

		app.get('/ticket/create', function(req, res){
    		res.sendFile(path.join(__dirname + '/views/ticketcreation.html'));
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

		//id can only be 5 digits from 0-9
		//for blog posts
		//Should connect to Postgres & return data
	app.get('/blog/:id([0-9]{5})', function(req, res){
	   res.send("TODO: Blog individual page goes here");
	   res.send('id: ' + req.params.id);
	});



	//**** BLOG GROUPING ****

	//any page the user searches for manually in URL with "blog" literal will show main page (for now)
	app.get(/blog/, function (req, res) {
  		res.sendFile(path.join(__dirname + '/views/bloghome.html'));
	});



		//id can only be 5 digits from 0-9
		//for tickets
		//Should connect to Postgres & return data
	app.get('/ticket/:id([0-9]{5})', function(req, res){
	   res.send("TODO: Ticket individual page goes here");
	   res.send('id: ' + req.params.id);
	});




//**** TICKET GROUPING ****

	//any page the user searches for manually in URL with "blog" literal will show main page (for now)
	app.get(/blog/, function (req, res) {
  		res.sendFile(path.join(__dirname + '/views/bloghome.html'));
	});



//***** OTHER ROUTES *****

	app.get('*', function(req, res){
	   res.send('Sorry, this is an invalid URL.');
	});





app.listen(3069);