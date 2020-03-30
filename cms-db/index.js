var express = require('express');
var app = express();

var things = require('./things.js');
//The app.use function call on route '/things' attaches the things router with this route
//basically like an include statement
app.use('/things', things);

app.get('/home', function(req, res){
   res.send("Hello world!");
});

app.get('/blog', function(req, res){
	res.send("Blog view will go here");
}):

app.get('/ticket', function(req, res){
	res.send("Ticketing will go here");
})

app.listen(3000);