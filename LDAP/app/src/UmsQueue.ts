import * as LdapTypes from "./LdapTypes/index";
import ldap, { NoSuchObjectError, InsufficientAccessRightsError, SearchEntry } from 'ldapjs';
import { EventEmitter } from 'events'
import { User } from "./users";
import LdapUtils from "./LdapUtils";
const { once } = require('events');
const Promises = require("bluebird");

const client:any = ldap.createClient({
    url: 'ldap://openldap'
});
Promises.promisifyAll(client);
client.bindAsync('cn=admin,dc=linuxlab,dc=salisbury,dc=edu', 'password', (err:any)=> {
console.log(err);
});

export class UmsQueue{

    static async getQueue():Promise<string[]>{

        let entry = await LdapUtils.searchOnce("cn=umsqueue,dc=linuxlab,dc=salisbury,dc=edu");
        entry = LdapUtils.normalizeUmsQueueQuery(entry);
        const dnList:string[] = [];

        for(const x of entry.hdQueueEntry){
            dnList.push(x);
        }
        console.log(dnList);
        return Promise.resolve(dnList);

    }

    static async push(newUser:User):Promise<User>{

        const changes = [];
        const dn:string = newUser.dn.toString();

        let entry = await LdapUtils.searchOnce("cn=umsqueue,dc=linuxlab,dc=salisbury,dc=edu");
        entry = LdapUtils.normalizeUmsQueueQuery(entry);
        console.log(entry);
        for(const x of entry.hdQueueEntry){
            if(x === dn){
                console.log("WARNING: Tried to add duplicate User to the UmsQueue (" + dn + ")");
                return Promise.resolve(newUser);
            }

        }
        changes.push(new ldap.Change({
            operation: 'add',
            modification: {
                hdQueueEntry: dn
            }
        }));

        await client.modifyAsync("cn=umsqueue,dc=linuxlab,dc=salisbury,dc=edu", changes)

        return Promise.resolve(newUser);
    }

    static async removeByDn(userToRemove:User):Promise<User>{

        const changes = [];
        const dn:string = userToRemove.dn.toString()

        let entry = await LdapUtils.searchOnce("cn=umsqueue,dc=linuxlab,dc=salisbury,dc=edu");
        entry = LdapUtils.normalizeUmsQueueQuery(entry);
        let inQueueFlag:boolean = false;
        for(const x of entry.hdQueueEntry){
            if(x === dn){

                inQueueFlag = true;
                break;
            }

        }
        if(!inQueueFlag){
            console.log("WARNING: Tried to remove User that is not in the UmsQueue (" + dn + ")");
            return Promise.resolve(userToRemove);
        }

        changes.push(new ldap.Change({
            operation: 'delete',
            modification: {
                hdQueueEntry: dn
            }
        }));

        await client.modifyAsync("cn=umsqueue,dc=linuxlab,dc=salisbury,dc=edu", changes)

        return Promise.resolve(userToRemove);

    }
}