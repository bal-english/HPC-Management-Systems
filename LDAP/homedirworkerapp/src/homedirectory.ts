const http = require('http');
const fs = require('fs');
const ncp = require('ncp').ncp;

if(process.env.UMS_HOSTNAME === undefined || process.env.UMS_HOSTNAME)
{
    console.log("ERROR: ")
}
http.get({
    hostname: process.env.UMS_HOSTNAME,

})

const testUsername = "mmandulak1";
ncp("../mnt/skel","../mnt/home/" + testUsername, (err:any)=>
{
    if(err)
    {
        return console.error(err);
    }
    console.log("coooool");
});

while(true)
{

}

// Do the rest of the worker stuff