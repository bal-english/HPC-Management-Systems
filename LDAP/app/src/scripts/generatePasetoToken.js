var paseto = require('paseto');
var crypto = require('crypto');


//note: Environment var is not set maybe can add line eighteen if you'd like
//Objective: make a token and print to console

//Goal: generate token
//node run generatePasetoToken.js
//outputs a thing that we can put into a environment variable
//thing get imported by main ums like app


(async () => {
    const {V2} = paseto;
    const key = await V2.generateKey('public'); 
    let exKey = key.export({
      type: 'pkcs8',
      format: 'pem'
    });
    let key2 = Buffer.from(exKey).toString('base64');
    console.log(key2);
    console.log(crypto.createHash('md5').update(key2).digest("hex"));
  })()

