import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
export default class OrganizationalUnit extends LdapKeyValuePair
    {
        public constructor(ou:string)
        {
            super("ou",ou);
        }
        public toString():string{
            return this.value;
        }
    }