"use strict"

var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	console.log("test get");
	res.end("get here");
});

router.post('/', function(req, res){
	req.on('data', function(data) {
    console.log("rec - " + data.toString());
  }); // convert data to string and append it to request body
	console.log("test post -");
	console.log(req.body);
	//console.log(req.body);
	res.end("post here");
});


module.exports = router;