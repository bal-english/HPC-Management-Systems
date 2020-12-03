/*
  Fix close & X button
  Implement pw reset
  thats it (probably)


*/
import * as bodyparser from 'body-parser';
import express from 'express';
import paseto from "paseto";
import { Request, Response } from 'express';
import { User } from "./users";
import { UmsQueue } from "./UmsQueue";
import { authenticateWorkerAuthToken, authenticateWorkerSessionToken } from "./workerauthentication";
import { createPrivateKey } from 'crypto';
import { validateUserPass, validateUserCN, validateUserDN, validateUserEmail } from "./validateUser";
import { UserGroups } from "./UserGroups";
import { authenticateUser } from "./authentication";
import path from 'path'
import { each } from 'bluebird';
import { authLogin } from './authenticateLogin';
import { Obfuscation } from './Obfuscation';
import * as main from "./main";
const cookieParser = require('cookie-parser')
const auth = require('./authentication');

// TESTING
User.createUserFromEmail("William Wolf", "wwolf1@gulls.salisbury.edu")
  .then(async (res: User) => {
    return res.save();
  })
  .then(async (res: User) => {
    await res.setUserPassword("Test");
  })
// TESTING

const { V2 } = paseto
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

(async () => {

  const key = await createPrivateKey(Buffer.from(process.env.AUTH_KEY, 'base64'));
  app.set('workerKey', key);

  // Generates static auth token
  // TODO
  //  - Middleware needs to be changed to admin role middleware
  //  - Ian has got it, talk to him
  app.post('/admin/homeDirQueue/createToken', authenticateWorkerAuthToken, async (request: Request, response: Response) => {
    const token = await V2.sign({ subject: 'auth_token', issuer: 'homedirqueue' }, app.get('workerKey'), { subject: 'auth_token', issuer: 'homedirqueue' });
    response.send({ 'token': token });

  });

  // Transform an auth token into a session token
  app.post('/api/homeDirQueue/session/renew_token', authenticateWorkerAuthToken, async (request: Request, response: Response) => {
    const token = await V2.sign({ subject: 'session_token', issuer: 'homedirqueue' }, app.get('workerKey'), { subject: 'session_token', issuer: 'homedirqueue' });
    response.send({ 'token': token });
  });

  app.get('/admin/tokenTest', async (request: Request, response: Response) => {
    response.sendFile('/app/views/pages/tokenTest.html');
  })

  app.post('/api/homeDirQueue/query', authenticateWorkerSessionToken, async (request: Request, response: Response) => {
    await new Promise<any>(async () => {
      const hdQueue = await UmsQueue.getQueue();
      if (hdQueue.length === 0) {
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
      .catch((err: any) => {
        console.log("ERROR: Tried to retrieve the home directory creation queue (" + request.originalUrl + ")");
        console.log(err);
        console.log(JSON.stringify(request));
        response.send({
          error: true,
        })
      });
  });

  app.post('/api/homeDirQueue/delete', authenticateWorkerSessionToken, async (request: Request, response: Response) => {
    const dn = request.body.dn;
    const currUser = await User.loadUser(dn);
    await UmsQueue.removeByDn(currUser)
      .catch((err: any) => {
        console.log("ERROR: Tried to remove a user (" + dn + ") from the home directory creation queue (" + request.originalUrl + ")");
        console.log(err);
        console.log(JSON.stringify(request));
        response.send({
          error: true,
        });
      })
  });

})()
const resetPWfunction = (modalToggle: boolean) => {
  if (!modalToggle) {
    return async (request: Request, response: Response) => {
      const email = request.body.email;
      try {
        if (!validateUserEmail(email)) {
          throw new Error("Invalid university email entered");
        }
        const tempEmail = request.body.email.split("@");
        const tempUID = "uid=" + tempEmail[0] + ",ou=people,dc=linuxlab,dc=salisbury,dc=edu";
        const res = await User.loadUser(tempUID);
        const token = await V2.sign({issuer: request.body.email}, app.get('key'), {issuer: request.body.email});
        console.log(token);
        // uhh note to richard email them the token
        response.send({
          modalToggle,
          email: request.body.email
        });
      } catch (error) {
        response.send({
          error: error.toString()
        });

      }
    }
  } else {
    return async (request1: Request, response1: Response) => {
      if (request1.body.state === 'token') {

        try {
          const tokenPW = request1.body.token;
          const keyPW = request1.app.get('key');
          const { V2: { verify, decrypt } } = paseto;
          const payload: any = await verify(tokenPW, keyPW, { maxTokenAge: '15m', issuer: request1.body.email });
          response1.send({

          });
        } catch (error) {
          response1.send({
            error: "ERROR: Invalid token. Please try again."
          });
        }
      } else if (request1.body.state === 'reset') {
        try {
          const payload = request1.body.token;
          const tempEmail = payload.issuer.split("@");
          const tempDN = "uid=" + tempEmail[0] + ",ou=people,dc=linuxlab,dc=salisbury,dc=edu"
          let res = await User.loadUser(tempDN);
          if (validateUserPass(request1.body.password)) {
            res = await res.setUserPassword(request1.body.password.getPass());
            response1.send({

            })
          } else {
            response1.send({
              error: "Password Error: must be composed of either letters, numbers or symbols <br> and at least 4 characters"
            });
          }
        } catch (error) {

          console.log("ERROR: Error when trying to reset password " + error.toString());
          response1.send({
            error: 'Unexpected error: ' + error.toString()
          });
        }
      }
    }
  }
}

app.post('/api/user/resetPW', resetPWfunction(false));

app.post('/api/user/verifyPWToken', resetPWfunction(true));

app.post('/api/user/changePW', async (req: Request, res: Response, next: any) => {

  if (req.body.password) {
    req.body.password = new Obfuscation(req.body.password);
  }
  try {
    const key = req.app.get('key');
    console.log(req.body);
    console.log("Squidward Tennisballs");
    if (req.body == null || req.body.token == null) {
       throw new Error('Malformed request');
    } else {
       const token = req.body.token;
       const { V2: { verify, decrypt } } = paseto
       const payload: any = await verify(token, key);
       req.body.token = payload;
       return next();
    }
 } catch (error) {
    if (error) {
       console.log("ERROR: Error when attempting to reset password " + error.toString());
       res.send({
        error: 'Unexpected error: ' + error.toString()
      })
    }
 }

},resetPWfunction(true));

app.get('/', (request: Request, response: Response) => {
  response.render('pages/login', {
    test: "HPCL UMS Test"
  });
});

app.get('/dashboard', [auth.authenticateUser, auth.checkPermissions(["admin", "faculty"])], (request: Request, response: Response) => {
  response.render('pages/dashboard', {
    test: "HPCL UMS Test2"
  });
});

app.get('/resetPW', /*auth.checkPermissions(["admin", "faculty", ])],*/(request: Request, response: Response) => {
  response.render('pages/resetPW', {
    test: "HPCL UMS Test2"
  });
});

app.get('/dashboard.js', (request: Request, response: Response) => {
  response.sendFile(path.join(__dirname, '../views/pages/dashboard.js'))
});


app.post('/api/user/create', [auth.authenticateUser, auth.checkPermissions(["admin"])], async (request: Request, response: Response) => {
  const email: string = request.body.email;
  const cn: string = request.body.cn;
  const password: Obfuscation = request.body.password;
  try {
    if (!validateUserEmail(email))
      throw new Error("Invalid university email entered");
    if (!validateUserCN(cn))
      throw new Error("Common name must be alphabetic and at least 3 characters");
    if (!validateUserPass(password))
      throw new Error("Password must be composed of either letters, numbers or symbols and at least 4 characters");

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

app.post('/api/user/modify', [auth.authenticateUser, auth.checkPermissions(["admin", "faculty"])], async (request: Request, response: Response) => {
  const dn: string = request.body.dn;
  try {
    if (!validateUserDN(dn))
      throw new Error("Invaid User ID, needs to be composed of letters and numbers");
    const tempUID = "uid=" + dn + ",ou=people,dc=linuxlab,dc=salisbury,dc=edu"
    const userPassword: Obfuscation = request.body.password;
    let res
    try {
      res = await User.loadUser(tempUID);
    } catch (error) {
      response.send({
        error: "Could not load user with that User ID",
      })
      return
    }
    if (validateUserPass(userPassword)) {
      res = await res.setUserPassword(userPassword.getPass());
    } else {
      throw new Error("Password Error: must be composed of either letters, numbers or symbols <br> and at least 4 characters");
    }
    await res.save();
    response.send({
    });
  }
  catch (err) {
    response.send({
      error: err.toString(),
    });
  }
});


app.post('/api/user/modifyOwn', [auth.authenticateUser, auth.checkPermissions(["admin", "faculty"])], async (request: Request, response: Response) => {
  const userPassword: Obfuscation = request.body.password;
  try {
    const key = request.app.get('key');
    const token = request.cookies.token;
    const { V2: { verify, decrypt } } = paseto
    const payload: any = await verify(token, key);
    let res = await User.loadUser(payload.uid);
    if (validateUserPass(userPassword)) {
      res = await res.setUserPassword(userPassword.getPass());
    } else {
      throw new Error("Password Error: must be composed of either letters, numbers or symbols and at least 4 characters");
    }
    await res.save();
    response.send({
    });
  }
  catch (err) {
    response.send({
      error: err.toString(),
    });
  }
});
// added authenticate user
app.post('/api/user/delete', [auth.authenticateUser, auth.checkPermissions(["faculty", "admin"])], async (request: Request, response: Response,) => {

  if (!validateUserEmail(request.body.email))
    throw new Error("Invaid university email entered");
  const tempEmail = request.body.email.split("@");
  const tempUID = "uid=" + tempEmail[0] + ",ou=people,dc=linuxlab,dc=salisbury,dc=edu";
  try {
    const user = await User.loadUser(tempUID)
    await user.disableUser();
    await user.save();
    response.send("User was successfully disabled!")
  }
  catch (error) {
    response.send({ error: "Error: User was not successfully disabled!" })
  }

});


app.post('/api/user/login', async (request: Request, response: Response) => {
  const email = request.body.email
  const password: Obfuscation = new Obfuscation(request.body.password);
  const tempEmail = request.body.email.split("@");
  const tempUID = "uid=" + tempEmail[0] + ",ou=people,dc=linuxlab,dc=salisbury,dc=edu"
  let user: User
  try {
    if (!validateUserEmail(email)) {
      throw new Error();
    }
    if (password.getPass() === "!!")
      throw new Error();
    await authLogin(tempUID, password)
  }
  catch (error) {
    if (error) {
      response.send({ error: "Could not login with the credentials" })
      return
    }

  }
  user = await User.loadUser(tempUID);
  const roles: string[] = await user.getRoles();
  const key = app.get('key');
  const { V2: { sign } } = paseto
  const token = await sign({ roles, uid: tempUID }, key)
  response.send(token);
});

app.post('/api/user/logout', async (request: Request, response: Response) => {
  response.send(true);
});


app.listen(80, 'node');