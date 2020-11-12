import paseto from "paseto";
import crypto from "crypto";


/*TODO (NEXT WEEK PROBLEM)
    - Refactor HTTP request to use Microsoft's typed-http-request
    - Employment of sesssion token refresh
    - Implement session token refresh on server side
    - That's it!
    - Have a good weekend!


    - MONDAY ERROR DOWN BELOW
    - ERROR: Caught exception when verifying authentication payload
node_1           | PasetoVerificationFailed: invalid signature
node_1           |     at verifyPaseto (/app/node_modules/paseto/lib/help/verify.js:39:11)
node_1           |     at async v2Verify (/app/node_modules/paseto/lib/v2/verify.js:24:31)
node_1           |     at async exports.authenticateWorker (/app/dist/workerauthentication.js:26:29) {
node_1           |   code: 'ERR_PASETO_VERIFICATION_FAILED'
node_1           | }

*/

const {V2} = paseto;
const {V2: { verify, decrypt } } = paseto;

export const authenticateWorker = async (req:any, res:any, next:any) => {

    try {
        const key = req.app.get('workerKey');
        if (req.body.token === null || req.body.token === undefined) {
            console.log("ERROR: Expected token but none was received");
            res.send({error:"The authentication token was never received"});
        } else {
            const token = req.body.token;
            // console.log(token, key);
            const payload:any = await verify(token, key, {maxTokenAge: '180 days'});
            // console.log(payload);
            return next();
        }
    } catch (error){
        if(error){
            console.log("ERROR: Caught exception when verifying authentication payload");
            console.log(error);
            res.send("Unspecified error in decrypting token");
        }
    }}

