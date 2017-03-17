"use strict"

var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	if(!req.app.serialport.isOpen()){
		req.app.serialport.open(function(){
				console.log("open port");
				res.send({status: true});
				res.end();
		});
	}
	else{
		res.send({status: true});
		res.end();
	}
});

module.exports = router;


