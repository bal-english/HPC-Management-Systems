import paseto from 'paseto'
import crypto from 'crypto'
import { User } from './users'
import { Obfuscation } from './Obfuscation'
import { response } from 'express'
import { isNamedExportBindings } from 'typescript'
const { V2 } = paseto
// lambda function fix

const authenticateUser = async (req: any, res: any, next: any) => { // asymmetric key
   // console.log("In authUSER");
   if (req.body.password) {
      req.body.password = new Obfuscation(req.body.password);
   }
   try {
      console.log("COOKIE" + req.cookies)
      const key = req.app.get('key');
      if (req.cookies == null || req.cookies.token == null) {
         res.redirect("/");
      } else {
         const token = req.cookies.token;
         const { V2: { verify, decrypt } } = paseto
         const payload: any = await verify(token, key);
         console.log("Not junk " + JSON.stringify(payload));
         return next();
      }
   } catch (error) {
      if (error)
         res.redirect("/");
   }
}
const checkPermissions = (pageRoles: string[]) => {

   return async (req: any, res: any, next: any) => {
      try {
         const key = req.app.get('key');
         const token = req.cookies.token;
         const { V2: { verify, decrypt } } = paseto
         const payload: any = await verify(token, key);
         const result = pageRoles.every(role => payload.roles.includes(role))
         console.log("User perm" + payload.roles)
         console.log("Page perm" + pageRoles)
         console.log("Result" + result)
         if (!result) {
            res.send("Error: No Permission to access page!")
            // res.redirect("/");
         }
         return result

      }
      catch (error) {
         if (error)
            res.redirect("/");
      }
   }
}
export { authenticateUser, checkPermissions };