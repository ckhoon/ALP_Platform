"use strict"

var express = require('express');
var router = express.Router();
var http = require('http');

router.post('/', function(req, res){
	console.log("ble plug turn on - ");
	req.on('data', function(data) {
		var reqDev = JSON.parse(data);
		console.log(reqDev);
		for (let dev of req.app.devices.blePlugs){
			if (dev.id == reqDev.id)
			{

				sendCmd(dev, function(body){
					console.log(body.toString());
				});

			}
		}
		res.end();
  });
});

function sendCmd(activeDev, callback){
	activeDev.cmd = [0x01];
	var jsonData = JSON.stringify(activeDev);
	//console.log(jsonData);

	var postheaders = {
	    'Content-Type' : 'application/json',
	    'Content-Length' : Buffer.byteLength(jsonData, 'utf8')
	};
	 
	var optionspost = {
	    host : '127.0.0.1',
	    port : 5000,
	    path : '/sendCmd',
	    method : 'POST',
	    headers : postheaders
	};

	var reqPost = http.request(optionspost, function(res) {
	    res.on('data', function(d) {
	        console.info('POST result:\n');
	        console.log(d.toString());
	        console.info('\n\nPOST completed');
	        callback(d);
	    });
	});

	reqPost.write(jsonData);
	reqPost.end();
	reqPost.on('error', function(e) {
	    console.error(e);
	});
}

module.exports = router;