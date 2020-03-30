var express = require('express');
var router = express.Router();

router.get('/home', function(req, res){
   res.send('GET route on things.');
});
router.post('/home', function(req, res){
   res.send('POST route on things.');
});

//export this router to use in our index.js
module.exports = router;