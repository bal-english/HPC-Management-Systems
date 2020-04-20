import { default as LdapKeyValuePair } from "./LdapKeyValuePair";

export default class CommonName extends LdapKeyValuePair
    {
        public constructor(cn:string)
        {
            super("cn",cn);
        }
        public toString():string{
            return this.value;
        }

        public setCommonName(cn:string):void{
            this.value = cn;
        }
    }