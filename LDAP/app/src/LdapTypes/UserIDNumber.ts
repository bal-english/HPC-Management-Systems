import { default as LdapKeyValuePairNum } from "./LdapKeyValuePairNum";
export default class UserIDNumber extends LdapKeyValuePairNum
    {
        public constructor(uid:number)
        {
            super("uidNumber",uid);
        }
        public toNumber():number{
            return this.value;
        }

    }