"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const ncp = require('ncp').ncp;
const testUsername = "mmandulak1";
ncp("../mnt/skel", "../mnt/home/" + testUsername, (err) => {
    if (err) {
        return console.error(err);
    }
    console.log("coooool");
});
while (true) {
}
// Do the rest of the worker stuff
//# sourceMappingURL=homedirectory.js.map