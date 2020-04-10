// import * as LdapTypes from "./LdapTypes/*";
// import type { DistinguishedName } from "./LdapTypes";
// import * as LdapTypes from "LdapTypes";
import * as LdapTypes from "./LdapTypes/index"


// import {OrganizationalUnit} from "./LdapTypes";
import ldap from 'ldapjs';
// import * as ldap from "./ldapjs";

const client:any = ldap.createClient({
        url: 'ldap://openldap'
    });
    client.bind('cn=admin,dc=linuxlab,dc=salisbury,dc=edu', 'password', (err:any)=> {
        console.log(err);
      });
export class User {
    isInDB:boolean;

    dn:LdapTypes.DistinguishedName;
    cn:LdapTypes.CommonName; //
    gidNumber:LdapTypes.GroupIDNumber;
    homeDirectory:LdapTypes.HomeDirectory;
    objectClass:LdapTypes.ObjectClass; // What do
    uid:LdapTypes.UserID;
    uidNumber:LdapTypes.UserIDNumber;
    sn:LdapTypes.Surname;

    static createUser(comName:string, email:string):User
    {
        const emailComponents:string[] = email.split("@",2);
        const dc:LdapTypes.LdapKeyValuePair[] = [
            new LdapTypes.DomainComponent("linuxlab"),
            new LdapTypes.DomainComponent("salisbury"),
            new LdapTypes.DomainComponent("edu"),
        ];
        const studentsDNComponents:LdapTypes.LdapKeyValuePair[]= [
            new LdapTypes.UserID(emailComponents[0]),
            new LdapTypes.OrganizationalUnit("people"),
        ].concat(dc);
        const objClassComponents:LdapTypes.LdapKeyValuePair[] = [
            new LdapTypes.ObjectClassPart("top"),
            new LdapTypes.ObjectClassPart("posixAccount"),
            new LdapTypes.ObjectClassPart("inetOrgPerson")
        ];
        const objClass:LdapTypes.ObjectClass = new LdapTypes.ObjectClass(objClassComponents);
        const dn:LdapTypes.DistinguishedName = new LdapTypes.DistinguishedName(studentsDNComponents);
        const cn:LdapTypes.CommonName = new LdapTypes.CommonName(comName);
        const gidNumber:LdapTypes.GroupIDNumber = new LdapTypes.GroupIDNumber(100);
        const uid:LdapTypes.UserID = new LdapTypes.UserID(emailComponents[0]);
        const uidNum:LdapTypes.UserIDNumber = new LdapTypes.UserIDNumber(69); // MAYBE
        const homeDir:LdapTypes.HomeDirectory = new LdapTypes.HomeDirectory("/home/" + uid.toString());
        const surname:LdapTypes.Surname = new LdapTypes.Surname(uid.toString());
        const inDBflag:boolean=false;
        // Ask Richard about DBflag
        const createdUser = new User(dn, cn, gidNumber, homeDir, objClass, uid, uidNum, surname, inDBflag);
        createdUser.isInDB=false; // come back to when making save

        return createdUser;

    }

    // every item as parameter
    private constructor(dn:LdapTypes.DistinguishedName,
        cn:LdapTypes.CommonName,
        gidNumber:LdapTypes.GroupIDNumber,
        homeDirectory:LdapTypes.HomeDirectory,
        objectClass:LdapTypes.ObjectClass,
        uid:LdapTypes.UserID,
        uidNumber:LdapTypes.UserIDNumber,
        sn:LdapTypes.Surname,
        isInDB:boolean){
            this.isInDB=isInDB;
            this.cn=cn;
            this.dn=dn;
            this.gidNumber=gidNumber;
            this.homeDirectory=homeDirectory
            this.objectClass=objectClass;
            this.uid=uid;
            this.uidNumber=uidNumber;
            this.sn=sn;
    }
    save():User{
        // Checks if user is in db by DN
        // -If already in, then throw error
        // -If not already in, add based on user object
        //    --Based on modify or create
        return this;
    }
    static loadUser(dn:string):User{
        // Finds user and returns user object
        // 1. LDAPsearch with DN
        // 2. Fill in user variables with fields from LDAP
        // 3. Return user object or Maybe if not found

        client.search(dn,(err:any,res:any)=>{
            res.on('searchEntry', (entry:any)=>{
                console.log('entry: ' + JSON.stringify(entry.object));
            });
        });

        return null;
    }
}