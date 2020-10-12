import express from 'express';
import * as bodyparser from 'body-parser';
import { Request, Response } from 'express';
const fs = require('fs');
const ncp = require('ncp').ncp;


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

//Do the rest of the worker stuff