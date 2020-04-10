import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
export default class DomainComponent extends LdapKeyValuePair
    {
        public constructor(dc:string)
        {
            super("dc",dc);
        }
        public toString():string{
            return this.value;
        }
    }