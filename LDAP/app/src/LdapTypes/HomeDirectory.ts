import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
export default class HomeDirectory extends LdapKeyValuePair
    {
        public constructor(hD:string)
        {
            super("homeDirectory",hD);
        }
        public toString():string{
            return this.value;
        }
    }