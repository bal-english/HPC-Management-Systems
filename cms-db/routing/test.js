var express = require('express');
var app = express();

var pg = require('pg');
var conn_str = "postgres://admin:password/db:5432/db";

var pgClient = new pg.Client(conn_str);

pgClient.connect();
