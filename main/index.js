"use strict"
const XBEE_MQ_EX = "xbee-mq-ex";
const BLE_MQ_EX = "ble-mq-ex";

var amqp = require('amqplib/callback_api');
var path = require('path');
var express = require('express');
var app = express();
var fs = require('fs');

var test = require('./routes/route_test');
var index = require('./routes/route_index');
var route_add_plug = require('./routes/route_add_plug');
var route_add_switchBle = require('./routes/route_add_switchBle');
var route_add_cabinetBle = require('./routes/route_add_cabinetBle');
var route_refresh = require('./routes/route_refresh');
var route_plug_turnOn = require('./routes/route_plug_turnOn');
var route_plug_turnOff = require('./routes/route_plug_turnOff');
var route_plug_monitor = require('./routes/route_plug_monitor');
var route_plug_status = require('./routes/route_plug_status');
var route_plug_del = require('./routes/route_plug_del');
var route_switch_del = require('./routes/route_switch_del');
var route_switch_status = require('./routes/route_switch_status');
var route_switch_monitor = require('./routes/route_switch_monitor');

//app.devices = {};
app.devices = JSON.parse(fs.readFileSync('devices.json', 'utf8'));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/add/plug', route_add_plug);
app.use('/add/switchBle', route_add_switchBle);
app.use('/add/cabinetBle', route_add_cabinetBle);
app.use('/plug/turnOn', route_plug_turnOn);
app.use('/plug/turnOff', route_plug_turnOff);
app.use('/plug/del', route_plug_del);
app.use('/plug/status', route_plug_status);
app.use('/switch/del', route_switch_del);
app.use('/switch/status', route_switch_status);
app.use('/refresh', route_refresh, refreshDevice);

app.use('/test', test);

amqp.connect('amqp://localhost', function(err, conn) {
	if (err != null)
	{
		console.log("Err - no mq server");
		return;
	}

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

  conn.createChannel(function(err, ch) {
    var ex = BLE_MQ_EX;
    ch.assertExchange(ex, 'topic', {durable: false});
    ch.assertQueue('', {exclusive: true}, function(err, q) {
    	app.bleQ = q;
			ch.consume(app.bleQ.queue, function(msg) {
				var reply = JSON.parse(msg.content);
      	for(let dev of app.devices.switches)
      	{
      		if(dev.id == msg.fields.routingKey)
      		{
      			dev.status = reply.data.data[0];
						//console.log(app.devices.plugs);
      		}
      	}
				console.log(reply.data.data);
	    }, {noAck: true});
    });
    app.bleCh = ch;
  });

});

function refreshDevice(req, res, next)
{
	for (let plug of app.devices.plugs){
		plug.status = -1;
		app.activeplug = plug;
		route_plug_monitor(app.activeplug);
		app.ch.bindQueue(app.q.queue, XBEE_MQ_EX, app.activeplug.id);
	}

	route_switch_monitor(app.devices.switches);
	for (let dev of app.devices.switches){
		dev.status = -1;
		app.ch.bindQueue(app.bleQ.queue, BLE_MQ_EX, dev.id);
		console.log(dev.id);
	}
}

/*
// production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/


var port = 3888; 
app.listen(port);
console.log("Listening on port " + port);