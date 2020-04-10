import { default as LdapKeyValuePairBag } from "./LdapKeyValuePairBag";
import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
export default class ObjectClass extends LdapKeyValuePairBag
    {
        public constructor(obj:LdapKeyValuePair[])
        {
            super(obj);
        }
        public toString():string{
            // return this.bag.map((value:LdapKeyValuePair)=>value.ldapKVString()).join(",");
            // Exception
            return "";
        }
    }