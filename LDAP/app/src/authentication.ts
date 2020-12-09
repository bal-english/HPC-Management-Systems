import paseto from 'paseto';
import { Obfuscation } from './Obfuscation';
const { V2 } = paseto;

const authenticateUser = async (req: any, res: any, next: any) => {

   if (req.body.password) {
      req.body.password = new Obfuscation(req.body.password);
   }
   try {
      const key = req.app.get('key');
      if (req.cookies == null || req.cookies.token == null) {
         res.redirect("/");
      } else {
         const token = req.cookies.token;
         const { V2: { verify } } = paseto
         const payload: any = await verify(token, key);
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
         const { V2: { verify } } = paseto;
         const payload: any = await verify(token, key);
         const result = pageRoles.every(role => payload.roles.includes(role));
         if (!result) {
            res.redirect("/");
         }
         return next();

      }
      catch (error) {
         if (error) {
            res.redirect("/");
            throw error;
         }
      }
   }
}
export { authenticateUser, checkPermissions };