"use strict"

var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	console.log("index");
	res.render('index');
});

module.exports = router;