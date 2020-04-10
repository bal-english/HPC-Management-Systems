import { default as LdapKeyValuePair } from "./LdapKeyValuePair";

export default class LdapKeyValuePairBag
    {
        protected bag:LdapKeyValuePair[];
        protected constructor(bag:LdapKeyValuePair[])
        {
            this.bag=bag;
        }
        public toArray():LdapKeyValuePair[]{
            return this.bag;
        }
    }