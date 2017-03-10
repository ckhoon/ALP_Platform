"use strict"

var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	console.log("test get");
	res.end("here");
});

module.exports = router;