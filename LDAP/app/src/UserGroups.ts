import * as LdapTypes from "./LdapTypes/index";
import { User } from "./users";
import { Group } from "./groups";

export class UserGroups{

    private userDn: string;
    private groupDn: string;

    public constructor(userDn:string, groupDn:string){
        this.userDn = userDn;
        this.groupDn = groupDn;

    }

    public async getUser():Promise<User>{
        return User.loadUser(this.userDn);

    }

    public async getGroup():Promise<Group>{
        return Group.loadGroup(this.groupDn);

    }

    public getUserDn():string{
        return this.userDn;
    }

    public getGroupDn():string{
        return this.groupDn;
    }

}