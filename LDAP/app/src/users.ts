import * as LdapTypes from "./LdapTypes/index";
import { UserGroups } from "./UserGroups";
import ldap, { NoSuchObjectError, InsufficientAccessRightsError, SearchEntry } from 'ldapjs';
import { EventEmitter } from 'events'
import { Group } from "./groups";
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



export class User {

    dn:LdapTypes.DistinguishedName;
    cn:LdapTypes.CommonName;
    gidNumber:LdapTypes.GroupIDNumber;
    homeDirectory:LdapTypes.HomeDirectory;
    objectClass:LdapTypes.ObjectClass;
    sn:LdapTypes.Surname;
    uid:LdapTypes.UserID;
    uidNumber:LdapTypes.UserIDNumber | undefined;
    userPassword:LdapTypes.UserPassword;
    loginShell:LdapTypes.LoginShell;
    isInDB: boolean;



    static async createUserFromEmail(comName:string, email:string):Promise<User>
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
        const homeDir: LdapTypes.HomeDirectory = new LdapTypes.HomeDirectory("/home/" + uid.toString());
        const surname:LdapTypes.Surname = new LdapTypes.Surname(uid.toString());
        const userPassword:LdapTypes.UserPassword = new LdapTypes.UserPassword("wordpass");
        const loginShell:LdapTypes.LoginShell = new LdapTypes.LoginShell("/bin/bash");
        const inDBflag:boolean=false;

        const createdUser = new User(dn, cn, gidNumber, homeDir, objClass, uid, null, surname, userPassword, loginShell, false);

        return Promise.resolve(createdUser);
    }

    public constructor(dn:LdapTypes.DistinguishedName,
        cn:LdapTypes.CommonName,
        gidNumber:LdapTypes.GroupIDNumber,
        homeDirectory:LdapTypes.HomeDirectory,
        objectClass:LdapTypes.ObjectClass,
        uid:LdapTypes.UserID,
        uidNumber:LdapTypes.UserIDNumber | undefined,
        sn:LdapTypes.Surname,
        userPassword:LdapTypes.UserPassword,
        loginShell:LdapTypes.LoginShell,
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
            this.loginShell=loginShell;
    }

        async disableUser():Promise<User>{
            this.loginShell = new LdapTypes.LoginShell("/sbin/nologin");
            return Promise.resolve(this);
        }

        async deleteUser():Promise<User>{
            if(this.isInDB)
            {
                return client.delAsync(this.dn.toString())
                .then((res:any)=>{return this.setInDB(false)})
            }
            return Promise.resolve(this);
        }

        static async getNextAndIncrementUserIDNumber():Promise<number>{

            const entry = await LdapUtils.searchOnce("cn=userconfiguration,ou=ldapconfig,dc=linuxlab,dc=salisbury,dc=edu")

            const res = Number(entry.object.suseNextUniqueId);

            const next:number = res + 1;

            const changes = [];

            changes.push(new ldap.Change({
                operation: 'delete',
                modification: {
                    suseNextUniqueId: String(res)
                }
            }));
            changes.push(new ldap.Change({
                operation: 'add',
                modification: {
                    suseNextUniqueId: String(next)
                }
            }));

            await client.modifyAsync("cn=userconfiguration,ou=ldapconfig,dc=linuxlab,dc=salisbury,dc=edu", changes)

            return Promise.resolve(res);

        }

        async listGroups():Promise<any>{

            const opts = {
                filter: '(objectClass=*)',
                attributes: ['dn', 'member'],
                scope: 'one'

              };

            const emitter:EventEmitter = await client.searchAsync("ou=group,dc=linuxlab,dc=salisbury,dc=edu", opts)
            let done:boolean = false;
            let arr:any = [];
            emitter.on('end', ()=> {
                done = true
            });
            emitter.on('searchEntry', (res:any)=> {
                arr.push(res);
            });

            function delay(ms: number) {
                return new Promise( resolve => setTimeout(resolve, ms) );
            }
            let totalTime = 0;
            while(!done && totalTime <= 50){
                await delay(10);
                totalTime += 10;
            }
            arr = await Promise.all(arr.map((res:any)=>res.objectName).map(Group.loadGroup))// TODO: res.listMembers is not a function, loadGroup is not returning something correctly
            arr = await Promise.all(arr.map((res:Group)=>res.listMembers()))
            arr = arr.flat()
            arr = arr.filter((res:UserGroups)=>res.getUserDn() === this.dn.toString())
            return arr




        }

    // save():User{
        async save():Promise<User>{
        // Checks if user is in db by DN
        // -If already in, then throw error
        // -If not already in, add based on user object
        //    --Based on modify or create

            // Add to DB
            if(!this.isInDB){

                if(!this.uidNumber){

                    this.uidNumber = new LdapTypes.UserIDNumber(await User.getNextAndIncrementUserIDNumber());

                }

                // return Promise.resolve((res:number)=>{
                    const entry:any = {
                        cn: this.cn.toString(),
                        gidNumber: this.gidNumber.toNumber(),
                        homeDirectory: this.homeDirectory.toString(),
                        objectClass: ['top', 'posixAccount', 'inetOrgPerson'],
                        sn: this.sn.toString(),
                        uid: this.uid.toString(),
                        uidNumber: this.uidNumber.toNumber(),
                        userPassword: this.userPassword.toString(),
                        loginShell: this.loginShell.toString(),
                    };
                    console.log(entry);

                    return client.addAsync(this.dn.toString(), entry)
                // })
                .then((res:any)=>{return this.setInDB(true)});

            } else {
                if(!(this.uidNumber)){
                    throw new Error("Tried to save User with undefined UID");
                }
                const changes = [];
                changes.push(new ldap.Change({
                    operation: 'replace',
                    modification: {
                        cn: this.cn.toString()
                    }
                }));

                changes.push(new ldap.Change({
                    operation: 'replace',
                    modification: {
                        gidNumber: this.gidNumber.toNumber()
                    }
                }));
                changes.push(new ldap.Change({
                    operation: 'replace',
                    modification: {
                        homeDirectory: this.homeDirectory.toString()
                    }
                }));
                changes.push(new ldap.Change({
                    operation: 'replace',
                    modification: {
                        userPassword: this.userPassword.toString()
                    }
                }));
                changes.push(new ldap.Change({
                    operation: 'replace',
                    modification: {
                        loginShell: this.loginShell.toString()
                    }
                }));

                return client.modifyAsync(this.dn.toString(), changes)
                .then((res:any)=>{return Promise.resolve(this)});

            }

        return Promise.reject();
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
        let loadedLoginShell: LdapTypes.LoginShell;
        const inDBflag: boolean = true;

        return LdapUtils.searchOnce(dn)
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
                loadedLoginShell = new LdapTypes.LoginShell(entry.object.loginShell);
                return Promise.resolve(new User(loadedDN,loadedCN,loadedGidNumber,loadedHomeDir,loadedObjClass,loadedUid,loadedUidNum,loadedSN,loadedUserPassword,loadedLoginShell,inDBflag));
            });
    }

    // change back to private after test
    public async setInDB(isInDB:boolean):Promise<User>{
        return Promise.resolve(this)
        .then((res:User)=>{
            res.isInDB = isInDB;
            return res;
        });
    }

    public async setCommonName(cn:string):Promise<User>{
        return Promise.resolve(this)
        .then((res:User)=>{
            res.cn = new LdapTypes.CommonName(cn);
            return res;
        });
    }


    public async setGIDNumber(gidNumber:number):Promise<User>{
        return Promise.resolve(this)
        .then((res:User)=>{
            res.gidNumber = new LdapTypes.GroupIDNumber(gidNumber);
            return res;
        });
    }

    public async setHomeDirectory(homeDirectory:string):Promise<User>{
        return Promise.resolve(this)
        .then((res:User)=>{
            res.homeDirectory = new LdapTypes.HomeDirectory(homeDirectory);
            return res;
        });
    }

    public async setUserPassword(userPassword:string):Promise<User>{
        return Promise.resolve(this)
        .then((res:User)=>{
            res.userPassword = new LdapTypes.UserPassword(userPassword);
            return res;
        });
    }
    public async setLoginShell(loginShell:string):Promise<User>{
        return Promise.resolve(this)
        .then((res:User)=>{
            res.loginShell = new LdapTypes.LoginShell(loginShell);
            return res;
        });
    }





}