"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require('http');
const fs = require('fs');
const ncp = require('ncp').ncp;
const path = require('path');
const restm = __importStar(require("typed-rest-client/RestClient"));
if (process.env.UMS_ADDRESS === undefined || process.env.UMS_ADDRESS === null) {
    throw new Error("ERROR: UMS_ADDRESS Environment variable is not set");
}
if (process.env.AUTH_TOKEN === undefined || process.env.AUTH_TOKEN === null) {
    throw new Error("ERROR: AUTH_TOKEN Environment variable is not set");
}
const restc = new restm.RestClient('homedirworker', process.env.UMS_ADDRESS);
// Trampolined variant of recursive directory walk, assumes symlinks & etc. should be treated as files
async function recursiveDirectoryWalk(filepath) {
    if (!path.isAbsolute(filepath)) {
        throw new Error("ERROR: recursiveDirectoryWalk requires an absolute path: " + filepath);
    }
    let todo = [filepath];
    const files = [];
    const directories = [];
    while (todo.length !== 0) {
        const stat = await fs.promises.lstat(todo[0]);
        if (stat.isDirectory()) {
            const currentDirectory = todo.shift();
            const directoryContents = await fs.promises.readdir(currentDirectory);
            directories.push(currentDirectory);
            todo = todo.concat(directoryContents.map((x) => {
                return path.join(currentDirectory, x);
            }));
        }
        else {
            files.push(todo.shift());
        }
    }
    return directories.concat(files);
}
async function requestSessionToken() {
    const tokenBuff = Buffer.from(process.env.AUTH_TOKEN, 'utf8');
    const b = {
        token: process.env.AUTH_TOKEN
    };
    const restRes = await restc.create('/api/homeDirQueue/session/renew_token', b);
    return restRes.result;
}
async function homeDirPolling() {
    let tc = await requestSessionToken();
    if (tc === null || tc === undefined) {
        console.log("ERROR: Function 'requestSessionToken' returned a null token.");
    }
    else {
        const restRes = await restc.create('/api/homeDirQueue/query', tc);
        if (restRes.result.dn !== undefined) {
            let uid = restRes.result.dn.split(',')[0];
            uid = uid.split('=')[1];
            const filepath = "/mnt/home/" + uid;
            ncp("/mnt/skel", filepath, async (err) => {
                if (err) {
                    console.log("ERROR: Tried to copy home directory but something went wrong");
                    console.log(err);
                }
                else {
                    try {
                        const files = await recursiveDirectoryWalk(filepath);
                        await Promise.all(files.map((x) => {
                            return fs.promises.chown(x, Number(restRes.result.uidNum), 100);
                        }));
                    }
                    catch (err) {
                        console.log("ERROR: Tried to change file ownership " + err);
                    }
                    tc = await requestSessionToken();
                    if (tc === null || tc === undefined) {
                        console.log("ERROR: Function 'requestSessionToken' returned a null token.");
                    }
                    else {
                        const d = {
                            token: tc.token,
                            dn: restRes.result.dn,
                            uidNum: restRes.result.uidNum,
                            empty: false
                        };
                        const restRes1 = await restc.create('/api/homeDirQueue/delete', d);
                    }
                }
            });
        }
    }
}
setInterval(homeDirPolling, 5000);
//# sourceMappingURL=homedirectory.js.map