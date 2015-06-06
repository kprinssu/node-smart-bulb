var express = require('express');
var app = express();
var bodyParser = require('body-parser');

//enable express to use body-parse to handle POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//get our port
var port = process.env.PORT || 3000;

var router = express.Router();