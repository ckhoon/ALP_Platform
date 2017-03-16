"use strict"

var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function(req, res){
	console.log("refresh devices");
	var devices = JSON.parse(fs.readFileSync('devices.json', 'utf8'));
	res.end(JSON.stringify(devices));
});

module.exports = router;