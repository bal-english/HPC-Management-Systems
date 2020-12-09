// validator has email & alphanumberic validation
// valididate better, ex. CN can take 3 spaces as valid
import { Obfuscation } from "./Obfuscation";

const validator = require('validator')

const validateUserPass = (password: Obfuscation) => {
    if (password){
        if (validator.isAscii(password.getPass())){
            if (password.getPass().length >= 4){
            return true;
            }
        }
    }
     return false;
}
const validateUserCN = (cn: string) => {
    if (/^[ A-Za-z]+$/.test(cn)){
        if ( cn.length >= 3){
            return true;
        }
    }
    return false;
}
const validateUserDN = (dn: string) => {
    if (/^[a-z0-9]+$/i.test(dn)){
        if ( dn.length >= 2){
            return true;
        }
    }
    return false;
}
// TODO: Use an email validation library
const validateUserEmail = (email: string) => {
    if  (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
        if(email.split("@")[1] === 'gulls.salisbury.edu' || email.split("@")[1] === 'salisbury.edu' ){
            return true;
        }
    }
    return false;
}
export {validateUserPass, validateUserCN, validateUserEmail, validateUserDN};