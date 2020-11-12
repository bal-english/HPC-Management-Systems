import { User } from "./users";
import { Group } from "./groups";
import {UmsQueue } from "./UmsQueue";
import { reduce } from "bluebird";
const ldap = require("ldapjs");
const assert= require('assert');
const Promises = require("bluebird");
const { once, EventEmitter } = require('events');

const client = ldap.createClient({
    url: 'ldap://openldap'
});

Promises.promisifyAll(client);

Group.createGroup("TravisScottBurger")
.then((res:Group)=>res.save())

.then(()=>User.createUserFromEmail("William Wolf", "wwolf1@gulls.salisbury.edu"))
.then((res:User)=> res.save())
.then((res:User)=>{
    UmsQueue.getQueue();
    return res;
})
.then((res:User)=> UmsQueue.removeByDn(res))
.then((res:User)=> UmsQueue.push(res))
.then((res:User)=> UmsQueue.push(res))
.then((res:User)=>{
    UmsQueue.getQueue();
    return res;
})
.then((res:User)=> UmsQueue.removeByDn(res))
.then((res:User)=> UmsQueue.removeByDn(res))
.then((res:any)=>{
    res.listGroups();
    return Promise.all([User.loadUser("uid=wwolf1,ou=people,dc=linuxlab,dc=salisbury,dc=edu"),
    Group.loadGroup("cn=TravisScottBurger,ou=group,dc=linuxlab,dc=salisbury,dc=edu")]);

})

.then((res:[User, Group])=>{
    return res[1].addMember(res[0]);

})


// Group.createGroup("TravisScottBurger")
// .then((res:Group)=>res.save())
.then(()=>Group.loadGroup("cn=TravisScottBurger,ou=group,dc=linuxlab,dc=salisbury,dc=edu"))
.then((res:any)=>{
    return res.listMembers(res);
})
.then((res:any)=>{
    console.log(res);
})






