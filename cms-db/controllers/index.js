	
	var express = require('express');
	var app = express();

	app.set('views','./views');
	var path = require('path');
	app.use(express.static('images'));

		//path prefix for serving static files. For example, if you want to provide a path prefix like '/static'
		//app.use('/static', express.static('public'));
		// Now whenever you need to include a file, for example, 
		// a script file called main.js residing in your public directory, use the following script tag −

		// <script src = "/static/main.js" />

		//This technique can come in handy when providing multiple directories as static files. 
		//These prefixes can help distinguish between multiple directories.

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
				res.send("Ticketing will go here");
			});



//********dynamic routing*********

		//put in any id and it will load a page
		// app.get('/:id', function(req, res){
		//    res.send('The id you specified is ' + req.params.id);
		// });

		//id can only be 5 digits from 0-9
		//for blog posts 
	app.get('/blog/:id([0-9]{5})', function(req, res){
	   res.send("TODO: Blog individual page goes here");
	   res.send('id: ' + req.params.id);
	});

		//id can only be 5 digits from 0-9
		//for tickets
	app.get('/ticket/:id([0-9]{5})', function(req, res){
	   res.send("TODO: Ticket individual page goes here");
	   res.send('id: ' + req.params.id);
	});




		//Other routes here
	app.get('*', function(req, res){
	   res.send('Sorry, this is an invalid URL.');
	});

app.listen(3069);