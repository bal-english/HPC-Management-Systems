import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
import { default as LdapKeyValuePairBag } from "./LdapKeyValuePairBag";
import { default as DomainComponent } from "./DomainComponent";
import { default as OrganizationalUnit } from "./OrganizationalUnit";
import { default as UserID } from "./UserID";
export default class DistinguishedName extends LdapKeyValuePairBag
    {
        static fromDNString(dn:string):DistinguishedName
        {
            const ret:LdapKeyValuePair[] = new Array();
            const dnsplit:string[]=dn.split(',');
            for(const val of dnsplit)
            {
                const keyValueSplit:string[]=val.split('=');
                // TODO: Error handling
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