import * as LdapTypes from "./LdapTypes/index";
import LdapUtils from "./LdapUtils"
import { User } from "./users";
import { UserGroups } from "./UserGroups"
import ldap from 'ldapjs';
const Promises = require("bluebird");

const client:any = ldap.createClient({
    url: 'ldap://openldap'
});

Promises.promisifyAll(client);

client.bindAsync('cn=admin,dc=linuxlab,dc=salisbury,dc=edu', 'password', (err:any)=> {
    console.log(err);
});

export class Group {
    SystemAccount:User | undefined;
    dn:LdapTypes.DistinguishedName;
    cn:LdapTypes.CommonName;
    gidNumber:LdapTypes.GroupIDNumber;
    objectClass:LdapTypes.ObjectClass;
    member:LdapTypes.MemberBag;
    isInDB:boolean;

    static async createGroup(comName:string):Promise<Group>{

        return Promise.resolve(LdapUtils.searchOnce("cn=groupconfiguration,ou=ldapconfig,dc=linuxlab,dc=salisbury,dc=edu")
            .then((entry: any) => {
                return Promise.resolve(Number(entry.object.suseNextUniqueId));
            })
            .then((res:number) => {
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

                return client.modifyAsync("cn=groupconfiguration,ou=ldapconfig,dc=linuxlab,dc=salisbury,dc=edu", changes)
                .then((_:any)=>{
                    return Promise.resolve(res);
                })

            })
            .then((res:number)=>{

                const tempCn = comName + "SystemAccount"
                const dc:LdapTypes.LdapKeyValuePair[] = [
                    new LdapTypes.DomainComponent("linuxlab"),
                    new LdapTypes.DomainComponent("salisbury"),
                    new LdapTypes.DomainComponent("edu"),
                ];
                const DNComponents:LdapTypes.LdapKeyValuePair[]= [
                    new LdapTypes.UserID(tempCn),
                    new LdapTypes.OrganizationalUnit("people"),
                ].concat(dc);
                const objClassComponents:LdapTypes.LdapKeyValuePair[] = [
                    new LdapTypes.ObjectClassPart("top"),
                    new LdapTypes.ObjectClassPart("inetOrgPerson"),
                    new LdapTypes.ObjectClassPart("posixAccount")
                ];

                const objClass:LdapTypes.ObjectClass = new LdapTypes.ObjectClass(objClassComponents);
                const dn:LdapTypes.DistinguishedName = new LdapTypes.DistinguishedName(DNComponents);
                const cn:LdapTypes.CommonName = new LdapTypes.CommonName(tempCn);
                const gidNumber:LdapTypes.GroupIDNumber = new LdapTypes.GroupIDNumber(100);
                const uid:LdapTypes.UserID = new LdapTypes.UserID(tempCn);
                const homeDir: LdapTypes.HomeDirectory = new LdapTypes.HomeDirectory("/home/" + uid.toString());
                const surname:LdapTypes.Surname = new LdapTypes.Surname(uid.toString());
                const loginShell:LdapTypes.LoginShell = new LdapTypes.LoginShell("/bin/nologin");
                const inDBflag:boolean=false;

                const x = new User(dn, cn, gidNumber, homeDir, objClass, uid, null, surname, loginShell, false);
                return [res, x];
            })
            .then((res:[number, User])=> {
                const dc:LdapTypes.LdapKeyValuePair[] = [
                    new LdapTypes.DomainComponent("linuxlab"),
                    new LdapTypes.DomainComponent("salisbury"),
                    new LdapTypes.DomainComponent("edu"),
                ];
                const groupDNComponents:LdapTypes.LdapKeyValuePair[]= [
                    new LdapTypes.CommonName(comName),
                    new LdapTypes.OrganizationalUnit("group"),

                ].concat(dc);
                const objClassComponents:LdapTypes.LdapKeyValuePair[] = [
                    new LdapTypes.ObjectClassPart("top"),
                    new LdapTypes.ObjectClassPart("posixGroup"),
                    new LdapTypes.ObjectClassPart("groupOfNames")
                ];
                const memberComponents:LdapTypes.LdapKeyValuePair[] = [
                    new LdapTypes.Member(res[1].dn.toString()),
                ];

                const objClass:LdapTypes.ObjectClass = new LdapTypes.ObjectClass(objClassComponents);
                const dn:LdapTypes.DistinguishedName = new LdapTypes.DistinguishedName(groupDNComponents);
                const cn:LdapTypes.CommonName = new LdapTypes.CommonName(comName);
                const member:LdapTypes.MemberBag = new LdapTypes.MemberBag(memberComponents);
                const inDBflag:boolean=false;

                const gidNum: LdapTypes.GroupIDNumber = new LdapTypes.GroupIDNumber(res[0]);
                const createdGroup = new Group(dn, cn, gidNum, objClass, member, false);
                createdGroup.SystemAccount = res[1];
                return Promise.resolve(createdGroup);
            }));
    }

    private constructor(dn:LdapTypes.DistinguishedName,
        cn:LdapTypes.CommonName,
        gidNumber:LdapTypes.GroupIDNumber,
        objectClass:LdapTypes.ObjectClass,
        member: LdapTypes.MemberBag,
        isInDB:boolean){
            this.isInDB=isInDB;
            this.cn=cn;
            this.dn=dn;
            this.gidNumber=gidNumber;
            this.member=member;
            this.objectClass=objectClass;
    }


    async deleteGroup():Promise<Group>{
        if(this.isInDB)
        {
            return client.delAsync(this.dn.toString())
            .then((res:any)=>{return this.setInDB(false)})
        }
        return Promise.resolve(this);
    }

    async save():Promise<Group>{
    // Checks if user is in db by DN
    // -If already in, then throw error
    // -If not already in, add based on user object
    //    --Based on modify or create

        // Add to DB
        if(!this.isInDB){
            const entry:any = {
                cn: this.cn.toString(),
                gidNumber: this.gidNumber.toNumber(),
                objectClass: ['top', 'posixGroup', 'groupOfNames'],
                member: this.member.toArray(),
            };
            return this.SystemAccount.save().then(()=> client.addAsync(this.dn.toString(), entry)).then((res:any)=>{return this.setInDB(true)});

        } else {
            throw new Error("Error: Group already exists in database");
        }
    }

    static async loadGroup(dn: string):Promise<Group>{
        // Finds group and returns group object
        // 1. LDAPsearch with DN
        // 2. Fill in user variables with fields from LDAP
        // 3. Return group object if found

        let loadedDN: LdapTypes.DistinguishedName;
        let loadedCN: LdapTypes.CommonName;
        let loadedGidNumber: LdapTypes.GroupIDNumber;
        let loadedObjClass: LdapTypes.ObjectClass;
        let loadedMember: LdapTypes.MemberBag;
        const inDBflag: boolean = true;

        return LdapUtils.searchOnce(dn).then(async (entry: any) => {

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
                    case "cn":
                        ret.push(new LdapTypes.CommonName(keyValueSplit[1]));
                        break;
                }
            }
            // Assemble the ObjectClass
            const objClassComponents: LdapTypes.LdapKeyValuePair[] = [
                new LdapTypes.ObjectClassPart(entry.object.objectClass[0]),
                new LdapTypes.ObjectClassPart(entry.object.objectClass[1]),
                new LdapTypes.ObjectClassPart(entry.object.objectClass[2])
            ];

            const memberComponents: LdapTypes.LdapKeyValuePair[] = [];

            for(const i of entry.object.member){
                memberComponents.push(new LdapTypes.Member(i));
            }

            loadedDN = new LdapTypes.DistinguishedName(ret);
            loadedObjClass = new LdapTypes.ObjectClass(objClassComponents);
            loadedCN = new LdapTypes.CommonName(entry.object.cn);
            loadedGidNumber = new LdapTypes.GroupIDNumber(entry.object.gidNumber);
            loadedMember = new LdapTypes.MemberBag(memberComponents);

            return Promise.resolve(new Group(loadedDN,loadedCN,loadedGidNumber,loadedObjClass,loadedMember, inDBflag));
        });
    }

    private async modifyMember(user:User, ldapOperation:string){
        /*if(!(ldapOperation in ['add', 'delete'])){
            throw Error("operation not supported: " + ldapOperation);
        }*/
        // Change to fixed version of above later
        if(ldapOperation !== 'add' && ldapOperation !== 'delete'){
            throw Error("operation not supported: " + ldapOperation);
        }
        LdapUtils.searchOnce(user.dn.toString())
        .then(async (entry: any) => {
            const changes = [];
            changes.push(new ldap.Change({
                operation: ldapOperation,
                modification: {
                    member: user.dn.toString()
                }
            }));

            return client.modifyAsync(this.dn.toString(), changes)
                    .then((res:any)=>{return Promise.resolve(this)});
        })
    }

    async addMember(user:User){
        this.modifyMember(user, 'add');
    }

    async removeMember(user:User){
        this.modifyMember(user, 'delete');
    }

    async listMembers():Promise<UserGroups[]>{
        return LdapUtils.searchOnce(this.dn.toString())
        .then(async(res:any)=>{
            res = LdapUtils.normalizeGroupQuery(res);
            return Promise.resolve(res.member.map((x:string):UserGroups=>{
                return new UserGroups(x, this.dn.toString());
            }));
        })
    }

    public async setInDB(isInDB:boolean):Promise<Group>{
        return Promise.resolve(this)
        .then((res:Group)=>{
            res.isInDB = isInDB;
            return res;
        });
    }

    public async setCommonName(cn:string):Promise<Group>{
        return Promise.resolve(this)
        .then((res:Group)=>{
            res.cn = new LdapTypes.CommonName(cn);
            return res;
        });
    }

    public async setGIDNumber(gidNumber:number):Promise<Group>{
        return Promise.resolve(this)
        .then((res:Group)=>{
            res.gidNumber = new LdapTypes.GroupIDNumber(gidNumber);
            return res;
        });
    }
}