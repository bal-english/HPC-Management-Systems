import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
export default class Surname extends LdapKeyValuePair
    {
        public constructor(sn:string)
        {
            super("sn",sn);
        }
        public toString():string{
            return this.value;
        }
    }