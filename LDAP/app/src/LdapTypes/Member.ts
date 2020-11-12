import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
export default class Member extends LdapKeyValuePair
    {
        public constructor(obj:string)
        {
            super("member",obj);
        }
        public toString():string{
            return this.value;
        }
    }