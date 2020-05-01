import * as express from 'express';
import * as bodyparser from 'body-parser';

const app = express();
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);

/*
let template = ejs.compile(str, options); template(data); // => Rendered HTML string
  ejs.render(str, data, options); // => Rendered HTML string
  ejs.renderFile(filename, data, options, function(err, str){ 
  // str => Rendered HTML string 
});
*/

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.get('/', (request, response) => {
  // response.sendFile(__dirname + '/views/pages/index.html');
  response.render('pages/index', {
    test: "Welcome Back... Richard"
  });
});

/*
TODO:
  -add error checking, user friendly format
  -refactor into API routings for JSON between client-server (/api/<domain>/<action>)
  -start with EJS, controller & view
  -bootstrap
*/

app.get('/api/user/:id', (request, response) => {

});

app.post('/api/user/create', (request, response) => {
  console.log(request.body);
  let email = request.body.email, cn = request.body.cn;
  response.send({
    error: 'this is an error'
  });
});

app.post('/api/user/modify', (request, response) => {
  console.log(request.body);
});

app.post('/api/user/delete', (request, response) => {
  console.log(request.body);
});

app.listen(8080);
