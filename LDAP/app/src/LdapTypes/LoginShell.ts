import { default as LdapKeyValuePair } from "./LdapKeyValuePair";
export default class LoginShell extends LdapKeyValuePair
    {
        public constructor(loginShell:string)
        {
            super("loginShell", loginShell);
        }
        public toString():string{
            return this.value;
        }

    }