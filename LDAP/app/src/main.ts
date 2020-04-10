// import "users.ts";
import { User } from "./users";
// let users:any = require("users.ts");

// User.loadUser("uid=dummyaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu");

const tempUser: User = User.loadUser("uid=dummyaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu", (loadUser: User) => { });
console.log(tempUser.dn.toString());
/*console.log(tempUser.toString());
console.log(tempUser.toString());
console.log(tempUser.toNumber());
console.log(tempUser.toNumber());
console.log(tempUser.toString());
console.log(tempUser.toString());*/