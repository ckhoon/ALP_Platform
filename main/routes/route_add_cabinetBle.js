"use strict"

var http = require('http');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var serviceUuid = '6e400001b5a3f393e0a9e50e24dcca9e';
var cabinetName = 'BT_MC';

String.prototype.convertToHex = function (delim) {
    return this.split("").map(function(c) {
        return ("0" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(delim || "");
};
//serviceUuid = serviceUuid.convertToHex();

router.get('/', function(req, res){
	console.log("add cabinetBle");
	scan(cabinetName, function(body){
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
					newSwitch.serviceUuids = scanDevice.serviceUuids;
					newSwitch.serviceUuid = serviceUuid;
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
module.exports = router;