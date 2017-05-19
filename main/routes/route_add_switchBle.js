"use strict"

var http = require('http');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var serviceUUID = '713d0000503e4c75ba943148f18d941e';

router.get('/', function(req, res){
	console.log("add switchBle");
	scan(serviceUUID, function(body){
		res.end(JSON.stringify(body));
		//res.end(body);
	});
});

function scan(reqServiceUUID, callback){
	var jsonData = {'serviceUUID' : reqServiceUUID};
	jsonData = JSON.stringify(jsonData);

	var postheaders = {
	    'Content-Type' : 'application/json',
	    'Content-Length' : Buffer.byteLength(jsonData, 'utf8')
	};
	 
	// the post options
	var optionspost = {
	    host : '127.0.0.1',
	    port : 5000,
	    path : '/scan',
	    method : 'POST',
	    headers : postheaders
	};

	// do the POST call
	var reqPost = http.request(optionspost, function(res) {
		res.on('data', function(body) {
			var newSwitch = {name: '' , id: -1};
			var scanDevices = JSON.parse(body);
			var devices = JSON.parse(fs.readFileSync('devices.json', 'utf8'));

			for (let scanDevice of scanDevices){
				var found =	devices.switches.filter(function(n){
						return n.id == scanDevice.address;
				});				
				if (found.length == 0)
				{
					newSwitch.name = scanDevice.localName;
					newSwitch.id = scanDevice.address;
					devices.switches.push(newSwitch);
					console.log(devices);
					fs.writeFile ("devices.json", JSON.stringify(devices, null, 2), function(err) {
						if (err) {
							console.log(err);
							throw err;
						}
					});
					break;
				}
			}
      callback(newSwitch);
    });
	});
	 
	// write the json data
	reqPost.write(jsonData);
	reqPost.end();
	reqPost.on('error', function(e) {
	    console.error(e);
	});

}

/*


function scan(callback){
	// the post options
	var optionsget = {
	    host : '127.0.0.1',
	    port : 4000,
	    path : '/scan',
	    method : 'GET',
	};

	var reqGet = http.request(optionsget, function(res) { 
		var body = '';
		res.on('data', function(chunk){
			body += chunk;
		});

		res.on('end', function(){
			var newPlug = {name: '' , id: -1};
			var scanDevices = JSON.parse(body);
			console.log(scanDevices);
			var devices = JSON.parse(fs.readFileSync('devices.json', 'utf8'));

			for (let scanDevice of scanDevices){
				var found =	devices.plugs.filter(function(n){
						return n.id == scanDevice.nodeIdentification.remote64;
				});
				if (found.length == 0)
				{
					newPlug.name = scanDevice.nodeIdentification.nodeIdentifier;
					newPlug.id = scanDevice.nodeIdentification.remote64;
					devices.plugs.push(newPlug);
					console.log(devices);
					fs.writeFile ("devices.json", JSON.stringify(devices, null, 2), function(err) {
						if (err) {
							console.log(err);
							throw err;
						}
					});
					break;
				}
			}
			callback(newPlug);
		});
	});

	reqGet.end();

	reqGet.on('error', function(e) {
	    console.error(e);
	});
}
*/
module.exports = router;