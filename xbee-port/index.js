"use strict"
const XBEE_MQ_EX = "xbee-mq-ex";

var amqp = require('amqplib/callback_api');
var express = require('express');
var app = express();
var util = require('util');
var XBee = require('serialport');
var xbee_api = require('xbee-api');
var configfile = require('./device.json');		//configuration file

var route_open = require('./routes/route_open');
var route_scan = require('./routes/route_scan');
var route_send = require('./routes/route_send');

app.use('/open', route_open);
app.use('/scan', route_scan);
app.use('/send', route_send);

app.isOpen = false;
app.NDframes = [];
app.isND = false;

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = XBEE_MQ_EX;
    ch.assertExchange(ex, 'topic', {durable: false});
    app.ch = ch;
  });
});

app.xbeeAPI = new xbee_api.XBeeAPI({ api_mode: 1 });

app.xbeeAPI.on("frame_object", function(frame) {
	console.log("OBJ> "+util.inspect(frame));
	if(frame.remote64)
	{
		console.log("sent to q")
		app.ch.publish(XBEE_MQ_EX, frame.remote64.toString(), new Buffer(JSON.stringify(frame)));
	}
	if(app.isND)
	{
		if(frame.type == 136)
			app.NDframes.push(frame);
	}
});

app.serialport = new XBee(configfile.dev, {
	autoOpen: false,
	baudrate: configfile.baudrate,		//reads baudrate from device.json
	parser: app.xbeeAPI.rawParser()
});

app.serialport.on("open", function(){
	console.log("Serial port open on "+ configfile.dev);
	app.isOpen = true;
});

app.get('/isOpen', function (req, res){
	res.send({status: app.serialport.isOpen()});
	res.end();
});

var server = app.listen(4000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("xBee app listening at " + port)
});


