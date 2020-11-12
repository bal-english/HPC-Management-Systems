import ldap, { NoSuchObjectError, InsufficientAccessRightsError, SearchEntry } from 'ldapjs';
import { Obfuscation } from './Obfuscation';
import { isConstructorDeclaration } from 'typescript';
const { once } = require('events');
const Promises = require("bluebird");

const authLogin = async (uid:string, pw:Obfuscation):Promise<any> =>{

   // static async loadUser(dn: string):Promise<User>{
    const client:any = ldap.createClient({
        url: 'ldap://openldap'
    });
    Promises.promisifyAll(client);
    const done:boolean = false;

    await client.bindAsync(uid, pw.getPass())

}
export {authLogin};