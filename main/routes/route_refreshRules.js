"use strict"

var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function(req, res, next){
	console.log("refresh rules");
	req.app.rules = JSON.parse(fs.readFileSync('rules.json', 'utf8'));
	res.end(JSON.stringify(req.app.rules));
});

module.exports = router;