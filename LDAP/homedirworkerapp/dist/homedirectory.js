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
//# sourceMappingURL=homedirectory.js.map