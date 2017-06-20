"use strict"

var express = require('express');
var http = require('http');

function sendCmd(activeDev){
	console.log("send ble command - ");
	console.log(activeDev);

	var jsonData = JSON.stringify(activeDev);
//	console.log(jsonData);

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
	    });
	});

	reqPost.write(jsonData);
	reqPost.end();
	reqPost.on('error', function(e) {
	    console.error(e);
	});
}

module.exports = sendCmd;