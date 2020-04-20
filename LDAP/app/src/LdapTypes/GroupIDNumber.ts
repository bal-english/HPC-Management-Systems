import { default as LdapKeyValuePairNum } from "./LdapKeyValuePairNum";
export default class GroupIDNumber extends LdapKeyValuePairNum // return as number or string? Ldapkeyvaluenum
    {
        public constructor(gid:number)
        {
            super("gidNumber",gid);
        }
        public toNumber():number{
            return this.value;
        }

        public setGIDNum(GIDNum:number):void{
            this.value = GIDNum;
        }
    }