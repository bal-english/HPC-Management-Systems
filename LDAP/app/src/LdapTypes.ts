//export namespace LdapTypes{
    export class LdapKeyValuePair
    {
        protected key:string;
        protected value:string;
        public ldapKVString():string
        {
            return (this.key + "=" + this.value); 
        }
        protected constructor(key:string, value:string)
        {
            this.key=key;
            this.value=value;
        }
    }
    export class LdapKeyValuePairNum
    {
        protected key:string;
        protected value:number;
        public ldapKVString():string
        {
            return (this.key + "=" + this.value); 
        }
        protected constructor(key:string, value:number)
        {
            this.key=key;
            this.value=value;
        }
    }
    export class LdapKeyValuePairBag
    {
        protected bag:LdapKeyValuePair[];
        protected constructor(bag:LdapKeyValuePair[])
        {
            this.bag=bag;
        }
        public toArray():LdapKeyValuePair[]{
            return this.bag;
        }
    }
    export class CommonName extends LdapKeyValuePair
    {
        public constructor(cn:string)
        {
            super("cn",cn);
        }
        public toString():string{
            return this.value;
        }
    }
    export class DistinguishedName extends LdapKeyValuePairBag
    {
        static fromDNString(dn:string):DistinguishedName
        {
            var ret:LdapKeyValuePair[];
            const dnsplit:string[]=dn.split(',');
            for(var val of dnsplit)
            {
                const keyValueSplit:string[]=val.split('=');
                //TODO: Error handling
                switch(keyValueSplit[0])
                {
                    case "dc":
                        ret.push(new DomainComponent(keyValueSplit[1]));
                        break;
                    case "ou":
                        ret.push(new OrganizationalUnit(keyValueSplit[1]));
                        break;
                    case "uid":
                        ret.push(new UserID(keyValueSplit[1]));
                        break;
                }
            }
            return new DistinguishedName(ret);
        }
        public constructor(dn:LdapKeyValuePair[])
        {
            super(dn);   
        }
        public toString():string{
            return this.bag.map((value:LdapKeyValuePair)=>value.ldapKVString()).join(",");
        }
    }
    export class DomainComponent extends LdapKeyValuePair
    {
        public constructor(dc:string)
        {
            super("dc",dc);
        }
        public toString():string{
            return this.value;
        }
    }
    export class OrganizationalUnit extends LdapKeyValuePair
    {
        public constructor(ou:string)
        {
            super("ou",ou);
        }
        public toString():string{
            return this.value;
        }
    }
    export class UserID extends LdapKeyValuePair
    {
        public constructor(uid:string)
        {
            super("uid",uid);
        }
        public toString():string{
            return this.value;
        }
    }
    export class Surname extends LdapKeyValuePair
    {
        public constructor(sn:string)
        {
            super("sn",sn);
        }
        public toString():string{
            return this.value;
        }
    }
    export class HomeDirectory extends LdapKeyValuePair
    {
        public constructor(hD:string)
        {
            super("homeDirectory",hD);
        }
        public toString():string{
            return this.value;
        }
    }
    export class GroupIDNumber extends LdapKeyValuePairNum //return as number or string? Ldapkeyvaluenum
    {
        public constructor(gid:number)
        {
            super("gidNumber",gid);
        }
        public toNumber():number{
            return this.value;
        }
    }
    export class UserIDNumber extends LdapKeyValuePairNum 
    {
        public constructor(uid:number)
        {
            super("uidNumber",uid);
        }
        public toNumber():number{
            return this.value;
        }
    }
    export class ObjectClass extends LdapKeyValuePairBag 
    {
        public constructor(obj:LdapKeyValuePair[])
        {
            super(obj);
        }
        public toString():string{
            //return this.bag.map((value:LdapKeyValuePair)=>value.ldapKVString()).join(",");
            //Exception
        }
    }
     
//}