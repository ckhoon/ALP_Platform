"use strict"

var express = require('express');
var router = express.Router();

router.post('/', function(req, res){
	req.on('data', function(data) {
		console.log("rec - " + data.toString()); 

		if(!req.app.serialport.isOpen()){
			console.log("serial port not open...")
		}else{
			var frame = JSON.parse(data);
			req.app.serialport.write(req.app.xbeeAPI.buildFrame(frame), function(err, respond) {
				if (err) throw(err);
					else {
						console.log("data sent.");
						res.send({status: true});
						res.end();
					}
			});
		}
	});
});

module.exports = router;
