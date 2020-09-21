const validator = require('validator')

const validateUserPass = (password: string) => {
if (validator.isAscii(password)){
    if (password.length > 4){
    return true;
    }
}
return false;
}
export {validateUserPass};