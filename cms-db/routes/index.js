var express = require('express');
var app = express();

app.set('view engine', 'pug');
app.set('views','./views');

var things = require('./things.js');
//The app.use function call on route '/things' attaches the things router with this route
//basically like an include statement
app.use('/things', things);

app.get('/home', function(req, res){
   res.send("Hello world!");
});

app.get('/blog', function(req, res){
	res.send("Blog view will go here");
});

app.get('/ticket', function(req, res){
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