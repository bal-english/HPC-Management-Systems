import paseto from "paseto";

const {V2} = paseto;
const {V2: { verify } } = paseto;

export const authenticateWorker = (maxTokenAge:string, subject:string) => {
    return async (req:any, res:any, next:any) => {

        try {
            const key = req.app.get('workerKey');
            if (req.body.token === null || req.body.token === undefined) {
                console.log("ERROR: Expected token but none was received");
                res.send({error:"The authentication token was never received"});
            } else {
                const token = req.body.token;
                const payload:any = await verify(token, key, {maxTokenAge, issuer: 'homedirqueue', subject});


                return next();
            }
        } catch (error){
            if(error){
                console.log("ERROR: Caught exception when verifying authentication payload");
                console.log(error);
                res.send("Unspecified error in decrypting token");
            }
        }
    }
}

export const authenticateWorkerAuthToken = authenticateWorker('180 days', 'auth_token');
export const authenticateWorkerSessionToken = authenticateWorker('15m', 'session_token');
