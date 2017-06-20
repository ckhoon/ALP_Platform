"use strict"

var http = require('http');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var serviceUuid = 'Temasek Poly ENG';
var devName = 'IOo';

String.prototype.convertToHex = function (delim) {
    return this.split("").map(function(c) {
        return ("0" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(delim || "");
};
serviceUuid = serviceUuid.convertToHex();

router.get('/', function(req, res){
	console.log("add ble plug");
	scan(devName, function(body){
		res.end(JSON.stringify(body));
		//res.end(body);
	});
});

function scan(reqSwitchName, callback){
	var jsonData = {'localName' : reqSwitchName};
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
			var newDev = {name: '' , id: -1};
			var scanDevices = JSON.parse(body);
			var devices = JSON.parse(fs.readFileSync('devices.json', 'utf8'));

			for (let scanDevice of scanDevices){
				var found =	devices.blePlugs.filter(function(n){
						return n.id == scanDevice.address;
				});				
				if (found.length == 0)
				{
					newDev.name = scanDevice.localName;
					newDev.id = scanDevice.address;
					newDev.serviceUuids = scanDevice.serviceUuids;
					newDev.serviceUuid = serviceUuid;
					devices.blePlugs.push(newDev);
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
      callback(newDev);
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