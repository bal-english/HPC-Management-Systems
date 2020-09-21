import paseto from 'paseto'
import crypto from 'crypto'
const {V2} = paseto

const authenticateUser = async (req:any, res:Response, next:any) => { // asymmetric key
const key = req.app.get('key');
console.log("Key:");
console.log(key);

 const { V2 : {sign} } = paseto
 const token = await sign( {modPass: true}, key) // replace sub with object
 const {V2: { verify, decrypt } } = paseto
 const payload = await verify(token, key);
 console.log(payload);
 return next();
}
export {authenticateUser};