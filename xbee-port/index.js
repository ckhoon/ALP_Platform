//		XBee services
//
const NT = 60;

var express = require('express');
var app = express();
var util = require('util');
var XBee = require('serialport');
var xbee_api = require('xbee-api');
var configfile = require('./device.json');		//configuration file
var devindex = 0;
var isOpen = false;

var C = xbee_api.constants;
var xbeeAPI = new xbee_api.XBeeAPI({ api_mode: 1 });
var NDframes = [];
var isND = false;

var cmdND = 
{
	type: 0x09, // xbee_api.constants.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST 
	id: 0x01, // optional, nextFrameId() is called per default 
	command: "ND",					//I/O pin D4
	commandParameter: [] //switch off 
};


xbeeAPI.on("frame_object", function(frame) {
	console.log("OBJ> "+util.inspect(frame));
	if(isND)
	{
		NDframes.push(frame);
	}
});

var serialport = new XBee(configfile.dev, {
	autoOpen: false,
	baudrate: configfile.baudrate,		//reads baudrate from device.json
	parser: xbeeAPI.rawParser()
});

serialport.on("open", function(){
	console.log("Serial port open on "+configfile.dev);
	isOpen = true;
});

app.get('/open', function (req, res) {
	if(!isOpen){
		serialport.open(function(){
				console.log("callback got it");
				res.send({status: true});
				res.end();
		});
	}
	else{
		res.send({status: true});
		res.end();
	}
});

app.get('/isOpen', function (req, res){
	res.end(serialport.isOpen().toString());
});

app.get('/scan', function (req, res) {
	if(!isOpen){
		console.log("serial port not open...");
	}else{
//			var frame = JSON.parse(data);
  	console.log("send ND cmd");
		serialport.write(xbeeAPI.buildFrame(cmdND), function(err) {
			if (err) throw(err);
			else console.log("done,..");
			isND = true;
			//res.end();
			setTimeout(function(){
				endScan(res);
			}, NT*100);
		});
	}
});

app.post('/status', function (req, res) {
	req.on('data', function(data) {
	    console.log("rec - " + data.toString()); 

		if(!isOpen){
			console.log("serial port not open...")
		}else{
			var frame = JSON.parse(data);
			serialport.write(xbeeAPI.buildFrame(frame), function(err, res) {
	    		if (err) throw(err);
				else console.log("done,..");
			});
		}
	});

	res.end( "status received" );
});


app.post('/send', function (req, res) {
	req.on('data', function(data) {
	    console.log("rec - " + data.toString()); 

		if(!isOpen){
			console.log("serial port not open...")
		}else{
			var frame = JSON.parse(data);
			serialport.write(xbeeAPI.buildFrame(frame), function(err, res) {
	    		if (err) throw(err);
				else console.log("done,..");
			});
		}
	});

	res.end( "Send received" );
});

var server = app.listen(4000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("xBee app listening at " + port)
});

function endScan(res){
	isND = false;

	res.writeHead(200, {
		'Content-Type' : 'application/json',
		'Content-Length' : Buffer.byteLength(JSON.stringify(NDframes), 'utf8')
	});

	res.write(JSON.stringify(NDframes));
	res.end();
	NDframes = [];
}