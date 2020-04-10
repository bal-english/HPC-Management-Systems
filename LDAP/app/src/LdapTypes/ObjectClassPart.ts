import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
export default class ObjectClassPart extends LdapKeyValuePair
    {
        public constructor(obj:string)
        {
            super("objectClass",obj);
        }
        public toString():string{
            return this.value;
        }
    }