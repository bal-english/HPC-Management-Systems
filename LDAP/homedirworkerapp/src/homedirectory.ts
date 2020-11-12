const http = require('http');
const fs = require('fs');
const ncp = require('ncp').ncp;
const path = require('path');

import { getRulesDirectories } from 'tslint/lib/configuration';
// import * as httpm from 'typed-rest-client/HttpClient';
import * as restm from 'typed-rest-client/RestClient';
import { Token } from 'typescript';

if(process.env.UMS_ADDRESS === undefined || process.env.UMS_ADDRESS === null)
{
    throw new Error("ERROR: UMS_ADDRESS Environment variable is not set");
}
if(process.env.AUTH_TOKEN === undefined || process.env.AUTH_TOKEN === null)
{
    throw new Error("ERROR: AUTH_TOKEN Environment variable is not set");
}

const restc: restm.RestClient = new restm.RestClient('homedirworker', process.env.UMS_ADDRESS);

// Trampolined variant of recursive directory walk, assumes symlinks & etc. should be treated as files
async function recursiveDirectoryWalk(filepath:string){

  if(!path.isAbsolute(filepath)){
    throw new Error("ERROR: recursiveDirectoryWalk requires an absolute path: " + filepath);
  }

  let todo:string[] = [filepath];
  const files:string[] = [];
  const directories:string[] = [];

  while(todo.length !== 0){
    const stat = await fs.promises.lstat(todo[0]);
    if(stat.isDirectory()){
      const currentDirectory = todo.shift();
      const directoryContents = await fs.promises.readdir(currentDirectory);
      directories.push(currentDirectory);
      todo = todo.concat(directoryContents.map((x:string)=>{
      return path.join(currentDirectory, x);
      }));
    } else {
      files.push(todo.shift());
    }
  }
  return directories.concat(files);
}

interface TokenCarrier{
  token: string;
}

interface UserInfo{
  dn?: string;
  uidNum?: number;
  empty: boolean;
}

interface TokenCarrierUserInfoCombo{
  token: string;
  dn: string;
  uidNum: number;
  empty: boolean;
}


async function requestSessionToken():Promise<TokenCarrier>{

  const tokenBuff = Buffer.from(process.env.AUTH_TOKEN, 'utf8');

  const b:TokenCarrier = {
    token: process.env.AUTH_TOKEN
  } as TokenCarrier;
  const restRes: restm.IRestResponse<TokenCarrier> = await restc.create<TokenCarrier>('/api/homeDirQueue/session/renew_token', b);
  return restRes.result;

}

async function homeDirPolling(){

  const tc = await requestSessionToken();
  if(tc === null || tc === undefined){
    console.log("ERROR: Function 'requestSessionToken' returned a null token.");
  } else {
    console.log(tc);
    const restRes: restm.IRestResponse<UserInfo> = await restc.create<UserInfo>('/api/homeDirQueue/query', tc);
    if(restRes.result.dn !== undefined){
      console.log(restRes.result, restRes.result.dn);

      let uid = restRes.result.dn.split(',')[0];
      uid = uid.split('=')[1];
      const filepath = "/mnt/home/" + uid;
      ncp("/mnt/skel", filepath, async (err:any)=>{
        if(err){
          console.log("ERROR: Tried to copy home directory but something went wrong");
          console.log(err);
        } else {

          try {
            const files = await recursiveDirectoryWalk(filepath);
            await Promise.all(files.map((x:string)=>{
              return fs.promises.chown(x, Number(restRes.result.uidNum), 100);
            }));
          } catch (err){
            console.log("ERROR: Tried to change file ownership " + err);
          }


          const d:TokenCarrierUserInfoCombo = {
            token: tc.token,
            dn: restRes.result.dn,
            uidNum: restRes.result.uidNum,
            empty: false
          }

          console.log(d)
          const restRes1: restm.IRestResponse<TokenCarrierUserInfoCombo> = await restc.create<TokenCarrierUserInfoCombo>('/api/homeDirQueue/delete', d);



        }
      })
    }
  }
}
  /*

              const req:any = http.request(options, (res1:any)=> {
                console.log('statusCode: ', res1.statusCode);
              })
              req.write(postData);
              req.end();
            }
          });
        });
    });
    */

setInterval(homeDirPolling, 5000);