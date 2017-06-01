"use strict"

var express = require('express');
var router = express.Router();
var http = require('http');
var fs = require('fs');

router.post('/', function(req, res){
	console.log("del switch - ");
	req.on('data', function(data) {
		var reqDev = JSON.parse(data);
		var status = -1;
		console.log(reqDev);
		for (let dev of req.app.devices.switches){
			if (dev.id == reqDev.id)
			{

				sendCmd(dev, function(body){
					console.log(body.toString());
				});

				var index = req.app.devices.switches.indexOf(dev);
				console.log(index);
				if (index != -1){
					status = index;
					req.app.devices.switches.splice(index, 1);
					console.log(req.app.devices);
					fs.writeFile ("devices.json", JSON.stringify(req.app.devices, null, 2), function(err) {
						if (err) {
							console.log(err);
							throw err;
						}
					});
					console.log("done");
				}
			}
		}
		res.send({'status' : status});
		res.end();
  });
});

function sendCmd(activeDev, callback){
	var jsonData = JSON.stringify(activeDev);
	console.log(jsonData);

	var postheaders = {
	    'Content-Type' : 'application/json',
	    'Content-Length' : Buffer.byteLength(jsonData, 'utf8')
	};
	 
	var optionspost = {
	    host : '127.0.0.1',
	    port : 5000,
	    path : '/delete',
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