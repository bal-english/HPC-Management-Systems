	var app = express();
	var express = require('express');
	var bodyParser = require('body-parser');
	var multer = require('multer');
	var upload = multer();

	app.set('view engine', 'pug');
	app.set('views','./views');

//The app.use function call on route '/things' attaches the things router with this route
//basically like an include statement
	var things = require('./things.js');

	app.use('/things', things);
	app.use(express.static('images'));

//path prefix for serving static files. For example, if you want to provide a path prefix like '/static'
//app.use('/static', express.static('public'));
// Now whenever you need to include a file, for example, 
// a script file called main.js residing in your public directory, use the following script tag −

// <script src = "/static/main.js" />

//This technique can come in handy when providing multiple directories as static files. 
//These prefixes can help distinguish between multiple directories.


	app.get('/home', function(req, res){
	   res.send("Hello world!");
	});

	app.get('/blog', function(req, res){
		res.send("Blog view will go here");
	});

	app.get('/ticket', function(req, res){
		res.send("Ticketing will go here");
	});

		app.get('/ticket/create', function(req, res){
			res.send("Ticketing will go here");
			res.render('form');
		});
	


//********dynamic routing*********

//put in any id and it will load a page
// app.get('/:id', function(req, res){
//    res.send('The id you specified is ' + req.params.id);
// });

//id can only be 5 digits from 0-9
//for blog posts 
	app.get('/blog/:id([0-9]{5})', function(req, res){
	   res.send('id: ' + req.params.id);
	});

//id can only be 5 digits from 0-9
//for tickets
	app.get('/ticket/:id([0-9]{5})', function(req, res){
	   res.send('id: ' + req.params.id);
	});




//Other routes here
	app.get('*', function(req, res){
	   res.send('Sorry, this is an invalid URL.');
	});

app.listen(3069);