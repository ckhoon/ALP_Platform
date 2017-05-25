"use strict"

var express = require('express');
var router = express.Router();
var http = require('http');
var serviceUuid = '713d0000503e4c75ba943148f18d941e';

function monitor(activeDevs){
	sendCmd(activeDevs, function(body){
		return (JSON.stringify(body.toString()));
	});
};

function sendCmd(activeDevs, callback){
	var jsonData = JSON.stringify(activeDevs);
	console.log(jsonData);

	var postheaders = {
	    'Content-Type' : 'application/json',
	    'Content-Length' : Buffer.byteLength(jsonData, 'utf8')
	};
	 
	var optionspost = {
	    host : '127.0.0.1',
	    port : 5000,
	    path : '/connect',
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

module.exports = monitor;