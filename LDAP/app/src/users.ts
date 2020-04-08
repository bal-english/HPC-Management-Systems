import * as LdapTypes from "./LdapTypes";
//import {OrganizationalUnit} from "./LdapTypes";
var ldap:any = require('ldapjs');
var client:any = ldap.createClient({
        url: 'ldap://openldap'
    });
class User {
    isInDB:boolean;

    dn:LdapTypes.DistinguishedName;
    cn:LdapTypes.CommonName; //
    gidNumber:LdapTypes.GroupIDNumber;
    homeDirectory:LdapTypes.HomeDirectory;
    objectClass:LdapTypes.ObjectClass; //What do
    uid:LdapTypes.UserID;
    uidNumber:LdapTypes.UserIDNumber;
    sn:LdapTypes.Surname;

    static createUser(comName:string, email:string):User
    {
        const emailComponents:string[] = email.split("@",2);
        var dc:LdapTypes.LdapKeyValuePair[] = [
            new LdapTypes.DomainComponent("linuxlab"),
            new LdapTypes.DomainComponent("salisbury"),
            new LdapTypes.DomainComponent("edu"),
        ];
        var studentsDNComponents:LdapTypes.LdapKeyValuePair[]= [
            new LdapTypes.UserID(emailComponents[0]),
            new LdapTypes.OrganizationalUnit("people"),
        ].concat(dc);
        var dn:LdapTypes.DistinguishedName = new LdapTypes.DistinguishedName(studentsDNComponents);
        var cn:LdapTypes.CommonName = new LdapTypes.CommonName(comName);
        var gidNumber:LdapTypes.GroupIDNumber = new LdapTypes.GroupIDNumber(100);
        var uid:LdapTypes.UserID = new LdapTypes.UserID(emailComponents[0]);
        var uidNum:LdapTypes.UserIDNumber; //MAYBE
        var homeDir:LdapTypes.HomeDirectory = new LdapTypes.HomeDirectory("/home/" + uid.toString());
        var surname:LdapTypes.Surname = new LdapTypes.Surname(uid.toString());
        var objClass:LdapTypes.ObjectClass; //what do
        var inDBflag:boolean=false;
        //Ask Richard about DBflag
        let createdUser = new User(dn, cn, gidNumber, homeDir, objClass, uid, uidNum, surname, inDBflag);
        createdUser.isInDB=false; //come back to when making save

        return createdUser;
        
    }

    //every item as parameter
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
        //Checks if user is in db by DN
        // -If already in, then throw error
        // -If not already in, add based on user object
        //    --Based on modify or create
        return this;
    }
    static loadUser(dn:string):User{
        //Finds user and returns user object
        //1. LDAPsearch with DN
        //2. Fill in user variables with fields from LDAP
        //3. Return user object or Maybe if not found
        client.search(dn, function(err:any,res:any){
            res.on('searchEntry', function(entry:any){
                console.log('entry: ' + JSON.stringify(entry.object));
            });
        });

        return null;
    }
}