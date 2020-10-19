import ldap, { SearchEntry } from 'ldapjs';
const { once } = require('events');
const Promises = require("bluebird");

const client:any = ldap.createClient({
    url: 'ldap://openldap'
});
Promises.promisifyAll(client);
client.bindAsync('cn=admin,dc=linuxlab,dc=salisbury,dc=edu', 'password', (err:any)=> {
console.log(err);
});

export default class LdapUtils{

    public static normalizeGroupQuery(res:SearchEntry){
        const ret:any = {member:null};

        for(const key of Object.getOwnPropertyNames(res.object)){
            ret[key] = res.object[key];
        }

        if(ret.member && !(Array.isArray(ret.member))){
            ret.member = [ret.member];
        }

        return ret;
    }

    public static normalizeUmsQueueQuery(res:SearchEntry){
        const ret:any = {hdQueueEntry:null};

        for(const key of Object.getOwnPropertyNames(res.object)){
            ret[key] = res.object[key];
        }

        if(ret.hdQueueEntry && !(Array.isArray(ret.hdQueueEntry))){
            ret.hdQueueEntry = [ret.hdQueueEntry];
        }

        if(ret.hdQueueEntry === null){
            ret.hdQueueEntry = [];
        }

        return ret;
    }

    public static async searchOnce(dn:string){
        return client.searchAsync(dn)
        .then(async(entry:any)=>{
            const [val] = await once(entry, 'searchEntry');
            return Promise.resolve(val);
        });
    }

}
