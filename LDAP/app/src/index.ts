import express from 'express';
import * as bodyparser from 'body-parser';
import { Request, Response } from 'express';
import { User } from "./users";
import {validateUserPass} from "./validateUser"
import {authenticateUser} from "./authentication"
import paseto from 'paseto'
import path from 'path'
import { each } from 'bluebird';
const {V2} = paseto
const app = express();
(async () => {
const key = await V2.generateKey('public')
app.set('key', key);
})()

app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const auth = require('./authentication');

app.get('/', auth.authenticateUser ,(request:Request, response:Response) => {
  response.render('pages/login', {
    test: "HPCL UMS Test"
  });
});
app.get('/dashboard', auth.authenticateUser ,(request:Request, response:Response) => {
  response.render('pages/dashboard', {
    test: "HPCL UMS Test2"
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
  const pw:string = request.body.pw;
  try {

    if (!validateUserPass(pw))
      throw new Error("Password Error: must be composed of either letters, numbers or symbols and at least 4 characters");
    const res = await User.createUserFromEmail(cn, email); //TODO push password into user
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
    /*if(cn.length!==0)
      res = await res.setCommonName(cn);
    if(gidNumber!==100)
      res = await res.setGIDNumber(gidNumber);
    */if(validateUserPass(userPassword)){
      res = await res.setUserPassword(userPassword);
    }else{
      throw new Error("Password Error: must be composed of either letters, numbers or symbols <br> and at least 4 characters");
    }
    /*if(homeDirectory.length!==0)
      res = await res.setHomeDirectory(homeDirectory);
    */const ressave = await res.save();
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


app.post('/api/user/login', auth.authenticateUser, async (request:Request, response:Response) => {
  const email = request.body.email
  const password = request.body.password
  const key = app.get("key");
  const { V2 : {sign} } = paseto
  const token = await sign( {modPass: true}, key)
  console.log(request.body);
  response.send(token);
});


app.listen(80, 'node');
