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
    test: "HPCL UMS Test"
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
});

app.post('/api/user/modify', async (request:Request, response:Response) => {
  console.log(request.body);
  const dn:string = request.body.dn;
  const cn:string = request.body.cn;
  const gidNumber:number = request.body.gidNumber;
  const userPassword:string = request.body.userPassword;
  const homeDirectory:string = request.body.homeDirectory;
  try {
    let res = await User.loadUser(dn);
    if(cn.length!==0)
      res = await res.setCommonName(cn);
    if(gidNumber!==100)
      res = await res.setGIDNumber(gidNumber);
    if(userPassword.length!==0)
      res = await res.setUserPassword(userPassword);
    if(homeDirectory.length!==0)
      res = await res.setHomeDirectory(homeDirectory);
    const ressave = await res.save();
    response.send({
      success: ressave,
    });
  }
  catch (err) {
    response.send({
      error: err.toString(),
    });
  }
});

app.post('/api/user/delete',(request:Request, response:Response) => {
  console.log(request.body);
});

app.listen(80, 'node');
