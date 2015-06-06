var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var noble = require('noble');

//enable express to use body-parse to handle POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//get our port
var port = process.env.PORT || 3000;

//routes
var router = express.Router();

