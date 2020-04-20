// import "users.ts";
import { User } from "./users";
// let users:any = require("users.ts");

// User.loadUser("uid=dummyaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu");


/*User.loadUser("uid=dumbaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu", (testUser: User) => {
    console.log(testUser.dn.toString());

});*/
const test:User=User.createUser("Michael Mandulak", "mmandulak1@linuxlab.salisbury.edu");
test.save();
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