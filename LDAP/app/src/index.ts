import express from 'express';
import * as bodyparser from 'body-parser';
import { Request, Response } from 'express';
import { User } from "./users";

const app = express();
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.get('/', (request:Request, response:Response) => {
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

app.get('/api/user/:id', (request:Request, response:Response) => {

});

app.post('/api/user/create', async (request:Request, response:Response) => {
  console.log(request.body);
  const email:string = request.body.email;
  const cn:string = request.body.cn;
  try {
    const res = await User.createUser(cn, email);
    const res1 = await res.save();
    response.send({
      success: res1,
    });
  }
  catch (err) {
    response.send({
      error: err.toString(),
    });
  }
  // .then((res:any)=> {return User.loadUser("uid=wwolf1,ou=people,dc=linuxlab,dc=salisbury,dc=edu")})

  response.send({
    error: 'this is an error'
  });
});

app.post('/api/user/modify', (request:Request, response:Response) => {
  console.log(request.body);
});

app.post('/api/user/delete',(request:Request, response:Response) => {
  console.log(request.body);
});

app.listen(80, 'node');
