"use strict"

var http = require('http');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var serviceUuid = 'Temasek Poly ENG';
var devName = 'BlindCtrl';

String.prototype.convertToHex = function (delim) {
    return this.split("").map(function(c) {
        return ("0" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(delim || "");
};
serviceUuid = serviceUuid.convertToHex();

router.get('/', function(req, res){
	console.log("add ble blind");
	scan(devName, function(body){
		res.end(JSON.stringify(body));
		//res.end(body);
	});
});

function scan(reqName, callback){
	var jsonData = {'localName' : reqName};
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
				var found =	devices.bleBlinds.filter(function(n){
						return n.id == scanDevice.address;
				});				
				if (found.length == 0)
				{
					newDev.name = scanDevice.localName;
					newDev.id = scanDevice.address;
					newDev.serviceUuids = scanDevice.serviceUuids;
					newDev.serviceUuid = serviceUuid;
					devices.bleBlinds.push(newDev);
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

module.exports = router;