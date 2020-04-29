import * as LdapTypes from "./LdapTypes/index";
import ldap, { NoSuchObjectError, InsufficientAccessRightsError } from 'ldapjs';
import TsMonad, { Maybe } from 'tsmonad';
import assert from 'assert';
const { once, EventEmitter } = require('events');
const Promises = require("bluebird");
// const assert = require('assert').strict;

const client:any = ldap.createClient({
        url: 'ldap://openldap'
});
Promises.promisifyAll(client);
client.bindAsync('cn=admin,dc=linuxlab,dc=salisbury,dc=edu', 'password', (err:any)=> {
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
    userPassword:LdapTypes.UserPassword;
    isInDB: boolean;


    static async createUser(comName:string, email:string):Promise<User>
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
        const userPassword:LdapTypes.UserPassword = new LdapTypes.UserPassword("wordpass");
        const inDBflag:boolean=false;
        const createdUser = new User(dn, cn, gidNumber, homeDir, objClass, uid, uidNum, surname, userPassword, inDBflag);
        createdUser.isInDB=false; // come back to when making save

        return Promise.resolve(createdUser);

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
        userPassword:LdapTypes.UserPassword,
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
            this.userPassword=userPassword;
    }
    // save():User{
        async save():Promise<User>{
        // Checks if user is in db by DN
        // -If already in, then throw error
        // -If not already in, add based on user object
        //    --Based on modify or create
        client.searchAsync(this.dn.toString(), (err:any, res:any)=>{
            assert.ifError(err);
            res.on('error', (error:any)=> { // Catches Error
                if(error.name==="NoSuchObjectError")
                {
                    if(this.isInDB)
                    {
                        // error
                    }
                    else
                    {
                        // Add to DB
                        const entry:any = {
                            cn: this.cn.toString(),
                            gidNumber: this.gidNumber.toNumber(),
                            homeDirectory: this.homeDirectory.toString(),
                            // objectClass: 'top',
                            // objectClass: 'posixAccount',
                            objectClass: ['top', 'posixAccount', 'inetOrgPerson'], // Ask Richard about bag + exception -return string array
                            sn: this.sn.toString(),
                            uid: this.uid.toString(),
                            uidNumber: 1,// this.uidNumber, // this.uidNumber Ask Richard  types:#
                            userPassword: this.userPassword.toString(),
                          };
                          console.log(this.dn.toString());
                          console.log(`cn: ${JSON.stringify(entry.cn)}`);
                          console.log(`gidNum: ${JSON.stringify(entry.gidNumber)}`);
                          console.log(`HD: ${JSON.stringify(entry.homeDirectory)}`);
                          console.log(`sn: ${JSON.stringify(entry.sn)}`);
                          console.log(`uid: ${JSON.stringify(entry.uid)}`);
                          console.log(`uidNumber: ${JSON.stringify(entry.uidNumber)}`); // Ask Richard about maybe print out
                          console.log(`Password: ${JSON.stringify(entry.userPassword)}`);
                          client.addAsync(this.dn.toString(),entry,(errorAdd:any)=>{
                            assert.ifError(errorAdd);
                            if(errorAdd)
                            {
                                console.log(errorAdd);
                            }
                          });
                    }
                }
                else
                {
                    console.error('error: ' + error.message);
                }
            });
            res.on('searchEntry', (entry: any) => {
                // modify if isInDB=true
                // error if isInDB=false
                if(this.isInDB)
                {
                    // modify

                    // const change:ldap.Change[] = [];


                    const change = new ldap.Change({
                        operation: 'replace',
                        modification: {
                          cn: this.cn,

                        }
                      });

                      // change[0].push(changeCN);


                    client.modifyAsync(this.dn.toString(), change, (errorModify:any)=> {
                        assert.ifError(errorModify);
                        if(errorModify)
                        {
                            console.log(errorModify);
                        }
                      });
                      // Check if sn is the same as uid, if not fix

                }
                else
                {
                    // error
                }
            });
            return Promise.resolve(this);
        });

        return Promise.resolve(this);
    }
    // static loadUser(dn: string, callback: (retUser:User)=> void):void{
        static async loadUser(dn: string):Promise<User>{
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
        let loadedUidNum: LdapTypes.UserIDNumber; // MAYBE
        let loadedUserPassword: LdapTypes.UserPassword;
        const inDBflag: boolean = true;

        return User.searchOnce(dn)
            .then(async (entry: any) => {
            // console.log('entry: ' + JSON.stringify(entry.object));
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
                loadedUserPassword = new LdapTypes.UserPassword("wordpass");
                return Promise.resolve(new User(loadedDN,loadedCN,loadedGidNumber,loadedHomeDir,loadedObjClass,loadedUid,loadedUidNum,loadedSN,loadedUserPassword,inDBflag));
            });
    }
    public static async searchOnce(dn:string){
        return client.searchAsync(dn)
        .then(async(entry:any)=>{
            const [val] = await once(entry, 'searchEntry');
            return Promise.resolve(val);
        });
    }
}