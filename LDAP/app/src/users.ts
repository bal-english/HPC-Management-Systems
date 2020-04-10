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
        const uidNum: LdapTypes.UserIDNumber = new LdapTypes.UserIDNumber(69); // MAYBE
        const homeDir: LdapTypes.HomeDirectory = new LdapTypes.HomeDirectory("/home/" + uid.toString());
        const surname:LdapTypes.Surname = new LdapTypes.Surname(uid.toString());
        const inDBflag:boolean=false;
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
    static loadUser(dn: string, callback: (name:User) => void):User{
        // Finds user and returns user object
        // 1. LDAPsearch with DN
        // 2. Fill in user variables with fields from LDAP
        // 3. Return user object or Maybe if not found

        let uid: LdapTypes.UserID;
        let objClass: LdapTypes.ObjectClass;
        let distinguishedName: LdapTypes.DistinguishedName;
        let cn: LdapTypes.CommonName;
        let gidNumber: LdapTypes.GroupIDNumber;
        let uidNum: LdapTypes.UserIDNumber; // MAYBE
        let homeDir: LdapTypes.HomeDirectory;
        let surname: LdapTypes.Surname;
        const inDBflag: boolean = true;

        client.search(dn,(err:any,res:any)=>{
            res.on('searchEntry', (entry:any)=>{
                console.log('entry: ' + JSON.stringify(entry.object));


                const objClassComponents: LdapTypes.LdapKeyValuePair[] = [
                    new LdapTypes.ObjectClassPart(entry.object.objectClass[0]),
                    new LdapTypes.ObjectClassPart(entry.object.objectClass[1]),
                    new LdapTypes.ObjectClassPart(entry.object.objectClass[2])
                ];
                objClass = new LdapTypes.ObjectClass(objClassComponents);

                const dnComponents: string[] = dn.split(",");
                const ret: LdapTypes.LdapKeyValuePair[] = new Array();
                for (const val of dnComponents) {
                    const keyValueSplit: string[] = val.split('=');
                    // TODO: Error handling
                    switch (keyValueSplit[0]) {
                        case "dc":
                            ret.push(new LdapTypes.DomainComponent(keyValueSplit[1]));
                            break;
                        case "ou":
                            ret.push(new LdapTypes.OrganizationalUnit(keyValueSplit[1]));
                            break;
                        case "uid":
                            ret.push(new LdapTypes.UserID(keyValueSplit[1]));
                            break;
                    }

                }

                distinguishedName = new LdapTypes.DistinguishedName(ret);

                uid = new LdapTypes.UserID(entry.object.uid);
                cn = new LdapTypes.CommonName(entry.object.cn);
                gidNumber = new LdapTypes.GroupIDNumber(entry.object.gidNumber);
                uidNum = new LdapTypes.UserIDNumber(entry.object.uidNumber);
                homeDir = new LdapTypes.HomeDirectory("/home/" + uid.toString());
                surname = new LdapTypes.Surname(entry.object.sn);

                /*
                console.log(distinguishedName.toString());
                console.log(uid.toString());
                console.log(cn.toString());
                console.log(gidNumber.toNumber());
                console.log(uidNum.toNumber());
                console.log(homeDir.toString());
                console.log(surname.toString());
                */

                const loadedUser = new User(distinguishedName, cn, gidNumber, homeDir, objClass, uid, uidNum, surname, inDBflag);
                callback(loadedUser);
                /* To ask Dr. Quack
                 *  1. Callback/return loadedUser
                 *  2. Controls in entry.object
                 *  3. Set-up exception for ObjectClass LDAP elements
                 *  4. How to integrate Billy & Ian w Michael & Dan
                 *  5. Set-up UID using Maybes
                 */

            });
        });



        return null;
    }
}