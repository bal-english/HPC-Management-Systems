// import "users.ts";
import { User } from "./users";
// const User = require("./users");
const ldap = require("ldapjs");
const assert= require('assert');
const Promises = require("bluebird");
// Promises.promisifyAll(require("./users"));

// let users:any = require("users.ts");

// User.loadUser("uid=dummyaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu");


/*User.loadUser("uid=dumbaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu", (testUser: User) => {
    console.log(testUser.dn.toString());

});*/
/*
class Whatever
{
    public y:string = "asdf";
    public run()
    {
        client.search("uid=dummyaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu", (err:any, res:any)=>{
            assert.ifError(err);
            res.on('error', (error:any)=>{
                console.log("errorrrrrr");
            })
            this.sety("lambsarecool");
            /*callbackClosure(y,(y:any)=>{
                y="hello";
            });
          });
    }
    private sety(valy:string)
    {
        this.y=valy;
        console.log("valstuff:" + this.y + " " + valy);

    }

}

const x:Whatever = new Whatever();
console.log("val:" + x.y);
x.run();
while(x.y==="asdf")
{
    console.log("lambssick");
}
console.log("val2:" + x.y);
*/
const { once, EventEmitter } = require('events');
export {};
const entry1:any = {
    cn: "Dan",
    gidNumber: 100,
    homeDirectory: "/home/dweitman1",
    // objectClass: 'top',
    // objectClass: 'posixAccount',
    objectClass: ['top', 'posixAccount', 'inetOrgPerson'], // Ask Richard about bag + exception -return string array
    sn: "dan",
    uid: "dweitman24",
    uidNumber: 4500,// this.uidNumber, // this.uidNumber Ask Richard  types:#
    userPassword: "pass"
  };
const client:any = ldap.createClient({
    url: 'ldap://openldap'
});

Promises.promisifyAll(client);
/*const test:User=User.createUser("Michael Mandulak", "mmandulak1@linuxlab.salisbury.edu");
const add=async ():Promise<void>=>{await test.save()};
add().then((res:any)=>{
    User.loadUser("uid=mmandulak1,ou=people,dc=linuxlab,dc=salisbury,dc=edu"); /* (testUser: User) => {
        // console.log(testUser.dn.toString());
        console.log("1" + testUser.cn.toString());
        testUser.cn.setCommonName("Dan");
        testUser.save();
        console.log(testUser.cn.toString());
    });
});
*/
/*
function doSearch(data){
    client.searchAsync()
}*/
client.bindAsync('cn=admin,dc=linuxlab,dc=salisbury,dc=edu', 'password')
    .then((res:any)=>client.addAsync("uid=dweitman24,ou=people,dc=linuxlab,dc=salisbury,dc=edu",entry1))
    .then((res:any)=>client.searchAsync("uid=dweitman24,ou=people,dc=linuxlab,dc=salisbury,dc=edu"))
    // .then((data:any, data1:any, data2:any)=>{return data.onAsync()})
    .then(async(entry:any)=>{
        const [val] = await once(entry, 'searchEntry');
        console.log(val);
    })
    .then(console.log)
    .catch((err:any)=>{
        console.log("error3: " + err);
    });
/*
const add=async ():Promise<void>=>{await client.add("uid=dweitman1,ou=people,dc=linuxlab,dc=salisbury,dc=edu",entry1,(errorAdd:any,res:any)=>{
    assert.ifError(errorAdd);
    if(errorAdd)
    {
        // console.log(errorAdd);
    }

    // console.log(res);
  });
};
add().then((res:any)=>{
    client.search("uid=dweitman1,ou=people,dc=linuxlab,dc=salisbury,dc=edu",(err:any, res2:any)=>{
    assert.ifError(err);
    res2.on('error', (error:any)=>{
        console.log("errorrrrrr");
    })
    res2.on('searchEntry', (entry: any) => {
        console.log('entry: ' + JSON.stringify(entry.object));
    })
  });
});



/*
function callbackClosure(i:any, callback:any){
    return function() {
      return callback(i);
    }
  }
const entry:any = {
    cn: "Dan",
    gidNumber: 100,
    homeDirectory: "/home/dweitman1",
    // objectClass: 'top',
    // objectClass: 'posixAccount',
    objectClass: ['top', 'posixAccount', 'inetOrgPerson'], // Ask Richard about bag + exception -return string array
    sn: "dan",
    uid: "dan",
    uidNumber: 4500,// this.uidNumber, // this.uidNumber Ask Richard  types:#
    userPassword: "pass"
  };
  const y:string = "lamb DAH";

  client.search("uid=dummyaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu", (err:any, res:any)=>{
    assert.ifError(err);
    res.on('error', (error:any)=>{
        console.log("errorrrrrr");
    })
    callbackClosure(y,(y:any)=>{
        y="hello";
    });
  });
  console.log(y);
/*const x:any = client.add("uid=dweitman1,ou=people,dc=linuxlab,dc=salisbury,dc=edu",entry,(errorAdd:any,res:any)=>{
    assert.ifError(errorAdd);
    if(errorAdd)
    {
        // console.log(errorAdd);
    }

    // console.log(res);
    return "hello";
  });
  console.log("x:" + x);
*/
/*const client:any = ldap.createClient({
    url: 'ldap://openldap'
});
client.bind('cn=admin,dc=linuxlab,dc=salisbury,dc=edu', 'password', (err:any)=> {

   console.log(err);
});*/
/*
const test:User=User.createUser("Michael Mandulak", "mmandulak1@linuxlab.salisbury.edu");
test.save();
/*client.unbind((err:any)=> {
    assert.ifError(err);
  });
client.bind('cn=admin,dc=linuxlab,dc=salisbury,dc=edu', 'password', (err:any)=> {
   console.log(err);
});
User.loadUser("uid=mmandulak1,ou=people,dc=linuxlab,dc=salisbury,dc=edu", (testUser: User) => {
    // console.log(testUser.dn.toString());
    console.log("1" + testUser.cn.toString());
    testUser.cn.setCommonName("Dan");
    testUser.save();
    console.log(testUser.cn.toString());
});

/*console.log(tempUser.toString());
console.log(tempUser.toString());
console.log(tempUser.toNumber());
console.log(tempUser.toNumber());
console.log(tempUser.toString());
console.log(tempUser.toString());*/