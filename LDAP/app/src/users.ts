import * as LdapTypes from "./LdapTypes/index";
import ldap from 'ldapjs';
const TsMonad = require('tsmonad');

const client:any = ldap.createClient({
        url: 'ldap://openldap'
});
    client.bind('cn=admin,dc=linuxlab,dc=salisbury,dc=edu', 'password', (err:any)=> {
        console.log(err);
    });

export class User {

    dn:LdapTypes.DistinguishedName;
    cn:LdapTypes.CommonName;
    gidNumber:LdapTypes.GroupIDNumber;
    homeDirectory:LdapTypes.HomeDirectory;
    objectClass:LdapTypes.ObjectClass;
    sn:LdapTypes.Surname;
    uid:LdapTypes.UserID;
    uidNumber:LdapTypes.UserIDNumber;
    isInDB: boolean;


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
    static loadUser(dn: string, callback: (retUser:User)=> void):void{
        // Finds user and returns user object
        // 1. LDAPsearch with DN
        // 2. Fill in user variables with fields from LDAP
        // 3. Return user object or Maybe if not found

        let loadedDN: LdapTypes.DistinguishedName;
        let loadedCN: LdapTypes.CommonName;
        let loadedGidNumber: LdapTypes.GroupIDNumber;
        let loadedHomeDir: LdapTypes.HomeDirectory;
        let loadedObjClass: LdapTypes.ObjectClass;
        let loadedSN: LdapTypes.Surname;
        let loadedUid: LdapTypes.UserID;
        let loadedUidNum: Maybe<LdapTypes.UserIDNumber>; // MAYBE
        const inDBflag: boolean = true;

        let loadedUser: User = null;

        client.search(dn,(err:any,res:any)=>{
            res.on('searchEntry', (entry: any) => {

                console.log('entry: ' + JSON.stringify(entry.object));

                // Assemble the dn
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
                // Assemble the ObjectClass
                const objClassComponents: LdapTypes.LdapKeyValuePair[] = [
                    new LdapTypes.ObjectClassPart(entry.object.objectClass[0]),
                    new LdapTypes.ObjectClassPart(entry.object.objectClass[1]),
                    new LdapTypes.ObjectClassPart(entry.object.objectClass[2])
                ];


                loadedDN = new LdapTypes.DistinguishedName(ret);
                loadedObjClass = new LdapTypes.ObjectClass(objClassComponents);
                loadedUid = new LdapTypes.UserID(entry.object.uid);
                loadedCN = new LdapTypes.CommonName(entry.object.cn);
                loadedGidNumber = new LdapTypes.GroupIDNumber(entry.object.gidNumber);
                loadedUidNum = new LdapTypes.UserIDNumber(entry.object.uidNumber);
                loadedHomeDir = new LdapTypes.HomeDirectory("/home/" + loadedUid.toString());
                loadedSN = new LdapTypes.Surname(entry.object.sn);

                /*
                console.log(distinguishedName.toString());
                console.log(uid.toString());
                console.log(cn.toString());
                console.log(gidNumber.toNumber());
                console.log(uidNum.toNumber());
                console.log(homeDir.toString());
                console.log(surname.toString());
                */

                loadedUser = new User(loadedDN, loadedCN, loadedGidNumber, loadedHomeDir,
                    loadedObjClass, loadedUid, loadedUidNum, loadedSN, inDBflag);

                callback(loadedUser);

                /* To ask Dr. Quack
                 *  1. Callback/return loadedUser DONE
                 *  2. Controls in entry.object DONE
                 *  3. Set-up exception for ObjectClass LDAP elements
                 *  4. How to integrate Billy & Ian w Michael & Dan
                 *  5. Set-up UID using Maybes
                 */

            });
        });

    }
}