import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
export default class UserPassword extends LdapKeyValuePair
    {
        public constructor(userPassword:string)
        {
            super("userPassword", userPassword);
        }
        public toString():string{
            return this.value;
        }

        public setPassword(password:string):void{
            this.value = password;
        }
    }