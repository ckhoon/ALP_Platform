"use strict"
const XBEE_MQ_EX = "xbee-mq-ex";

var amqp = require('amqplib/callback_api');
var path = require('path');
var express = require('express');
var app = express();
var test = require('./routes/route_test');
var index = require('./routes/route_index');
var route_add_plug = require('./routes/route_add_plug');
var route_add_switchBle = require('./routes/route_add_switchBle');
var route_refresh = require('./routes/route_refresh');
var route_plug_turnOn = require('./routes/route_plug_turnOn');
var route_plug_turnOff = require('./routes/route_plug_turnOff');
var route_plug_monitor = require('./routes/route_plug_monitor');
var route_plug_status = require('./routes/route_plug_status');

app.devices = {};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/add/plug', route_add_plug);
app.use('/add/switchBle', route_add_switchBle);
app.use('/plug/turnOn', route_plug_turnOn);
app.use('/plug/turnOff', route_plug_turnOff);
app.use('/refresh', route_refresh, refreshDevice);
app.use('/plug/status', route_plug_status);

app.use('/test', test);

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = XBEE_MQ_EX;
    ch.assertExchange(ex, 'topic', {durable: false});
    ch.assertQueue('', {exclusive: true}, function(err, q) {
    	app.q = q;
			ch.consume(app.q.queue, function(msg) {
				var reply = JSON.parse(msg.content);
				if (reply.type == 146){
	      //console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
	      	for(let plug of app.devices.plugs)
	      	{
	      		if(plug.id == msg.fields.routingKey)
	      		{
	      			plug.status = reply.digitalSamples.DIO4
							//console.log(app.devices.plugs);
	      		}
	      	}
				}
	    }, {noAck: true});
    });
    app.ch = ch;
  });
});

function refreshDevice(req, res, next)
{
	console.log(app.devices.plugs);
	for (let plug of app.devices.plugs){
		app.activeplug = plug;
		route_plug_monitor(app.activeplug);
		app.ch.bindQueue(app.q.queue, XBEE_MQ_EX, app.activeplug.id);
	}
}

// production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port = 3000; 
app.listen(port);
console.log("Listening on port " + port);