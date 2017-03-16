"use strict"

var http = require('http');
var express = require('express');
var router = express.Router();
var fs = require('fs');

var isOpen = false;

router.get('/', function(req, res){
	console.log("add Plug");

	openPort(function(isOpen){
		if (isOpen){
			scan(function(body){
				console.log(body);
				res.end(JSON.stringify(body));
			});
		}
		else
			res.end("error");
	});
});

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

function openPort(callback){
	var optionsget = {
	    host : '127.0.0.1',
	    port : 4000,
	    path : '/open',
	    method : 'GET',
	};
  console.log("sending port open req");

	http.request(optionsget, function(res) {
		console.log("statusCode: ", res.statusCode);
		console.log("headers: ", res.headers);

		var body = '';
		res.on('data', function(chunk){
			body += chunk;
		});

		res.on('end', function(){
			var fbResponse = JSON.parse(body);
			console.log("Got a body: ", body);
			console.log("Got a fbResponse: ", fbResponse.status);
			callback(fbResponse.status);
		});
	}).end();
}

module.exports = router;