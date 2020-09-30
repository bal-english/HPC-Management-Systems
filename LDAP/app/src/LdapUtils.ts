import ldap, { SearchEntry } from 'ldapjs';

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

}
