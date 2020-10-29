import express from 'express';
import * as bodyparser from 'body-parser';
import { Request, Response } from 'express';
import { User } from "./users";
import { UmsQueue } from "./UmsQueue";

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

app.post('/api/homeDirQueue/delete', async (request:Request, response:Response) => {
  const dn = request.body.dn;
  const currUser = await User.loadUser(dn);
  await UmsQueue.removeByDn(currUser)
  .catch((err:any)=>
  {
    console.log("ERROR: Tried to remove a user (" + dn + ") from the home directory creation queue (" + request.originalUrl + ")");
    console.log(err);
    console.log(JSON.stringify(request));
    response.send({
      error: true,
    });
  })
});

app.get('/api/homeDirQueue/query', async (request:Request, response:Response) => {
  await new Promise<any>(async ()=>{
    const hdQueue = await UmsQueue.getQueue();
    if(hdQueue.length === 0){
      response.send({
        empty: true
      });
      return;
    }
    const currUser = await User.loadUser(hdQueue[0]);
    response.send({
      empty: false,
      dn: hdQueue[0],
      uidNum: currUser.uidNumber.toNumber()
    });
  })
  .catch((err:any)=>{
    console.log("ERROR: Tried to retrieve the home directory creation queue (" + request.originalUrl + ")");
    console.log(err);
    console.log(JSON.stringify(request));
    response.send({
      error: true,
    })
  });
});

app.post('/api/user/create', async (request:Request, response:Response) => {
  console.log(request.body);
  const email:string = request.body.email;
  const cn:string = request.body.cn;
  try {
    const res = await User.createUserFromEmail(cn, email);
    const res1 = await res.save();
    await UmsQueue.push(res);
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
