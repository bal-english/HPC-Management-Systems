import ldap, { NoSuchObjectError, InsufficientAccessRightsError, SearchEntry } from 'ldapjs';
import { Obfuscation } from './Obfuscation';
const { once } = require('events');
const Promises = require("bluebird");
import { User } from "./users";

const authLogin = async (uid:string, pw:Obfuscation):Promise<any> =>{

    const client:any = ldap.createClient({
        url: 'ldap://openldap'
    });
    Promises.promisifyAll(client);
    const done:boolean = false;
    const user = await User.loadUser(uid);
    if(user.loginShell.toString() === '/sbin/nologin'){
        throw new Error();
    }
    await client.bindAsync(uid, pw.getPass())

}
export {authLogin};