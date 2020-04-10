export default class LdapKeyValuePairNum
    {
        protected key:string;
        protected value:number;
        public ldapKVString():string
        {
            return (this.key + "=" + this.value);
        }
        protected constructor(key:string, value:number)
        {
            this.key=key;
            this.value=value;
        }
    }