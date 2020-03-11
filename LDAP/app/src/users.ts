class User {
    ldap:any = require('ldapjs');
    client:any = this.ldap.createClient({
        url: 'ldap://mmandulak1_openldap_1'
    });
    dn:string;
    ou:string;
    cn:string;
    gidNumber:number;
    homeDirectory:string;
    objectClass:string;
    uid:string;
    uidNumber:number;
    sn:string;

    //constructor(distNum:string){

    //}
    static createUser(comName:string, email:string)
    {
        var createdUser = new User();

    }

    
    private constructor(){

        //this->uidNumber should be of type Maybe[int]
        this.cn=comName;
        this.gidNumber=100;
        this.ou="people";
        var emailComponents:string[] = email.split("@",2);
        this.uid=emailComponents[0];
        this.sn=this.uid; 
        this.homeDirectory="/home/" + this.uid;
        var splitDot=emailComponents[1].split(".");
        this.dn="uid=" + this.uid; 

    }
}