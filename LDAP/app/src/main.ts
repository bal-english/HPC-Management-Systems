// import "users.ts";
import { User } from "./users";
// let users:any = require("users.ts");

// User.loadUser("uid=dummyaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu");


User.loadUser("uid=dumbaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu", (testUser: User) => {
    console.log(testUser.dn.toString());

});



/*console.log(tempUser.toString());
console.log(tempUser.toString());
console.log(tempUser.toNumber());
console.log(tempUser.toNumber());
console.log(tempUser.toString());
console.log(tempUser.toString());*/