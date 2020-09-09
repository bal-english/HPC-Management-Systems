import { User } from "./users";
const ldap = require("ldapjs");
const assert= require('assert');
const Promises = require("bluebird");

const { once, EventEmitter } = require('events');

const client = ldap.createClient({
    url: 'ldap://openldap'
});

Promises.promisifyAll(client);

User.createUser("William Wolf", "wwolf1@gulls.salisbury.edu")
// .then((res:User)=>res.save())
.then((res:any)=> {return User.loadUser("uid=mmandulak1,ou=people,dc=linuxlab,dc=salisbury,dc=edu")})
// .then((res:any)=>{return res.disableUser()})
// .then((res:any)=>res.save())
// .then((res:any)=>res.deleteUser())
// .then((res:any)=>{res.setInDB(true)})
// .then((res:any)=>res.deleteUser())
.then(console.log);

