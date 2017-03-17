"use strict"
const NT = 60;

var express = require('express');
var router = express.Router();

var cmdND = 
{
	type: 0x09, // xbee_api.constants.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST 
	id: 0x01, // optional, nextFrameId() is called per default 
	command: "ND",					//I/O pin D4
	commandParameter: [] //switch off 
};

router.get('/', function(req, res){
	if(!req.app.serialport.isOpen()){
		console.log("serial port not open...");
	}else{
		console.log("send ND cmd");
		req.app.serialport.write(req.app.xbeeAPI.buildFrame(cmdND), function(err) {
			if (err) throw(err);
			else console.log("done,..");
			req.app.isND = true;

			setTimeout(function(){
				endScan(req, res);
			}, NT*100);
		});
	}
});

function endScan(req, res){
	req.app.isND = false;

	res.writeHead(200, {
		'Content-Type' : 'application/json',
		'Content-Length' : Buffer.byteLength(JSON.stringify(req.app.NDframes), 'utf8')
	});

	res.write(JSON.stringify(req.app.NDframes));
	res.end();
	req.app.NDframes = [];
}

module.exports = router;

