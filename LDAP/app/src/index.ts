import express from 'express';
import * as bodyparser from 'body-parser';
import { Request, Response } from 'express';
import { User } from "./users";
import {validateUserPass} from "./validateUser"
import {UserGroups} from "./UserGroups"
import {authenticateUser} from "./authentication"
import paseto from 'paseto'
import path from 'path'
import { each } from 'bluebird';
import { UserPassword } from './LdapTypes';
import { authLogin } from './authenticateLogin';
import { Obfuscation } from './Obfuscation';
import * as main from "./main"
const cookieParser = require('cookie-parser')
// Obfuscate middleware
// add auth to all but login
// modify needs to call midleware
const {V2} = paseto
const app = express();
(async () => {
const key = await V2.generateKey('public')
app.set('key', key);
})()
app.use(cookieParser());
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const auth = require('./authentication');

// TESTING
User.createUserFromEmail("William Wolf", "wwolf1@gulls.salisbury.edu", "Test")
.then((res:User)=>res.save())

app.get('/', (request:Request, response:Response) => {
  response.render('pages/login', {
    test: "HPCL UMS Test"
  });
});
app.get('/dashboard', [auth.authenticateUser], /*auth.checkPermissions(["admin", "faculty", ])],*/ (request:Request, response:Response) => {
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

// app.get('/api/user/:id', (request:Request, response:Response) => {
// });
app.get('/dashboard.js', (request:Request, response:Response) => {
  response.sendFile( path.join(__dirname, '../views/pages/dashboard.js'))
});


app.post('/api/user/create',[auth.authenticateUser], /*
auth.checkPermissions(["admin"])] ,*/ async (request:Request, response:Response) => {
  console.log(request.body);
  const email:string = request.body.email;
  const cn:string = request.body.cn;
  const pw:string = request.body.pw;
  try {

    if (!validateUserPass(pw))
      throw new Error("Password Error: must be composed of either letters, numbers or symbols and at least 4 characters");
    const res = await User.createUserFromEmail(cn, email, pw); // TODO push password into user
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
// added auth user
app.post('/api/user/modify', [auth.authenticateUser], /*auth.checkPermissions(["faculty", "admin"])],*/ async (request:Request, response:Response) => {
  console.log(request.body);
  const dn:string = request.body.dn;
  const cn:string = request.body.cn;
  const gidNumber:number = request.body.gidNumber;
  const userPassword:string = request.body.userPassword;
  const homeDirectory:string = request.body.homeDirectory;
  try {
    let res = await User.loadUser(dn);
   if(validateUserPass(userPassword)){
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
// added authenticate user
app.post('/api/user/delete',[auth.authenticateUser], /*auth.checkPermissions(["faculty", "admin"])],*/ async(request:Request, response:Response,) => {
  // console.log(request.body.email + "REQ")
  const tempEmail = request.body.email.split("@");
  // console.log(tempEmail+ "TEMP")
  const tempUID = "uid=" + tempEmail[0] + ",ou=people,dc=linuxlab,dc=salisbury,dc=edu"
  // console.log("TEMPUID" + tempUID)
  const user = await User.loadUser(tempUID)
  try {
   // console.log("user" + user)
    await user.disableUser();
    await user.save();
    response.send("User was successfully disabled!")
  }
  catch(error){
    console.log("Error: User was not successfully disabled!")
    response.send({error:"Error: User was not successfully disabled!"})
  }

});


app.post('/api/user/login', async (request:Request, response:Response) => {
  const email = request.body.email
  const password:Obfuscation = new Obfuscation(request.body.password);
  const tempEmail = request.body.email.split("@");
  const tempUID = "uid=" + tempEmail[0] + ",ou=people,dc=linuxlab,dc=salisbury,dc=edu"
  let user:User
  try {
    if(password.getPass() === "!!")
      throw new Error();
    await authLogin(tempUID, password)
    console.log("End of the try block")
    }
  catch(error) {
    console.log("In the catch block")
    if (error){
    console.log("caught error")
    response.send({error:"No Account Found!"})
    return
    }

  }
  console.log("Finsihed Try catch block")
  user = await User.loadUser(tempUID);
  const roles:string[] = await user.getRoles();
  const key = app.get("key");
  const { V2 : {sign} } = paseto
  const token = await sign({roles}, key)
  response.send(token);
});

app.post('/api/user/logout', async (request:Request, response:Response) => {
  response.send(true);
});


app.listen(80, 'node');
