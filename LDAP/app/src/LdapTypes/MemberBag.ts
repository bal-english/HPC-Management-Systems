import { default as LdapKeyValuePairBag } from "./LdapKeyValuePairBag";
import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
import { default as Member } from "./Member"
export default class MemberBag extends LdapKeyValuePairBag
    {
        public constructor(obj:LdapKeyValuePair[])
        {
            super(obj);
        }
        public toString():string{
            // return this.bag.map((value:LdapKeyValuePair)=>value.ldapKVString()).join(",");
            // Exception make string array
            return "";
        }
        public getMember(dn:string):Member|null{
            for(const i of this.bag){
                if(dn === i.getValue()){
                    return i;
                }
            }

            return null;
        }


    }