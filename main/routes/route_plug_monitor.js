"use strict"

var express = require('express');
var router = express.Router();
var http = require('http');

var isOpen = false;

var cmdData = 
{
	type: 0x17,
	id: 0x01,
//	destination64: "0013A20040B93AF0",
	destination16: "fffe",
	remoteCommandOptions: 0x02,
	command: "IR",
	commandParameter: [ 0x0B, 0xB8 ]
};

function monitor(activeplug){
	console.log("turn on plug");

	openPort(function(isOpen){
		if (isOpen){
			sendCmd(activeplug.id, function(body){
				return (JSON.stringify(body.toString()));
			});
		}
		else{
			console.log("unable to open xbee port");
			return ("error");
		}
	});
};

function openPort(callback){
	var optionsget = {
	    host : '127.0.0.1',
	    port : 4000,
	    path : '/open',
	    method : 'GET',
	};
  console.log("sending port open req");

	var req = http.request(optionsget, function(res) {
		//console.log("statusCode: ", res.statusCode);
		//console.log("headers: ", res.headers);

		var body = '';
		res.on('data', function(chunk){
			body += chunk;
		});

		res.on('end', function(){
			var fbResponse = JSON.parse(body);
			//console.log("Got a body: ", body);
			//console.log("Got a fbResponse: ", fbResponse.status);
			callback(fbResponse.status);
		});

	})
	req.on('error', function(e) {
    console.error(e);
	});

	req.end();

}

function sendCmd(plugid, callback){
	cmdData.destination64 = plugid;
	var jsonData = JSON.stringify(cmdData);

	var postheaders = {
	    'Content-Type' : 'application/json',
	    'Content-Length' : Buffer.byteLength(jsonData, 'utf8')
	};
	 
	// the post options
	var optionspost = {
	    host : '127.0.0.1',
	    port : 4000,
	    path : '/send',
	    method : 'POST',
	    headers : postheaders
	};

	// do the POST call
	var reqPost = http.request(optionspost, function(res) {
	    //console.log("statusCode: ", res.statusCode);
	    //console.log("headers: ", res.headers);
	 
	    res.on('data', function(d) {
	        console.info('POST result:\n');
	        console.log(d.toString());
	        console.info('\n\nPOST completed');
	        callback(d);
	    });
	});
	 
	// write the json data
	reqPost.write(jsonData);
	reqPost.end();
	reqPost.on('error', function(e) {
	    console.error(e);
	});

}

module.exports = monitor;