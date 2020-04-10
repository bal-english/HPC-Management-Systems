import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
export default class UserID extends LdapKeyValuePair
    {
        public constructor(uid:string)
        {
            super("uid",uid);
        }
        public toString():string{
            return this.value;
        }
    }