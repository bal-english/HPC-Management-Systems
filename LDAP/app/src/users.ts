class User {
    ldap:any = require('ldapjs');
    client:any = this.ldap.createClient({
        url: 'ldap://mmandulak1_openldap_1'
    });
    ou:string;
    cn:string;
    gidNumber:number;
    homeDirectory:string;
    objectClass:string;
    sn:string;
    uid:string;
    uidNumber:number;
}