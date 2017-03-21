"use strict"

var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function(req, res, next){
	console.log("refresh devices");
	req.app.devices = JSON.parse(fs.readFileSync('devices.json', 'utf8'));
	res.end(JSON.stringify(req.app.devices));
	next();
});

module.exports = router;