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
	command: "D4",
	commandParameter: [ 0x05 ]
};

router.post('/', function(req, res){
	console.log("turn on plug");

	req.on('data', function(data) {
		var plug = JSON.parse(data);

		openPort(function(isOpen){
			if (isOpen){
				sendCmd(plug.id, function(body){
					res.end(JSON.stringify(body.toString()));
				});
			}
			else
				res.end("error");
		});

  });
});

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
	    console.log("statusCode: ", res.statusCode);
	    console.log("headers: ", res.headers);
	 
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

module.exports = router;