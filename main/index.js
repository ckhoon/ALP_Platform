"use strict"
const XBEE_MQ_EX = "xbee-mq-ex";
const BLE_MQ_EX = "ble-mq-ex";

const TIMEOUT_SENDCMD = 15*1000;

var amqp = require('amqplib/callback_api');
var path = require('path');
var express = require('express');
var app = express();
var fs = require('fs');

var test = require('./routes/route_test');
var index = require('./routes/route_index');

var route_add_plug = require('./routes/route_add_plug');
var route_add_switchBle = require('./routes/route_add_switchBle');
var route_add_ble_Plug = require('./routes/route_add_ble_Plug');
var route_add_ble_door = require('./routes/route_add_ble_door');
var route_add_ble_blind = require('./routes/route_add_ble_blind');
var route_add_cabinetBle = require('./routes/route_add_cabinetBle');

var route_plug_del = require('./routes/route_plug_del');
var route_plug_status = require('./routes/route_plug_status');
var route_plug_turnOn = require('./routes/route_plug_turnOn');
var route_plug_turnOff = require('./routes/route_plug_turnOff');
var route_plug_monitor = require('./routes/route_plug_monitor');

var route_switch_del = require('./routes/route_switch_del');
var route_switch_status = require('./routes/route_switch_status');
var route_switch_monitor = require('./routes/route_switch_monitor');

var route_ble_plug_del = require('./routes/route_ble_plug_del');
var route_ble_plug_status = require('./routes/route_ble_plug_status');
var route_ble_plug_turnOn = require('./routes/route_ble_plug_turnOn');
var route_ble_plug_turnOff = require('./routes/route_ble_plug_turnOff');

var route_ble_door_del = require('./routes/route_ble_door_del');
var route_ble_door_turnOn = require('./routes/route_ble_door_turnOn');

var route_ble_blind_del = require('./routes/route_ble_blind_del');
var route_ble_blind_turnLeft = require('./routes/route_ble_blind_turnLeft');
var route_ble_blind_turnRight = require('./routes/route_ble_blind_turnRight');

var route_ble_sendCmd = require('./routes/route_ble_sendCmd');

var route_refresh = require('./routes/route_refresh');
var route_refreshRules = require('./routes/route_refreshRules');

//app.devices = {};
app.devices = JSON.parse(fs.readFileSync('devices.json', 'utf8'));
app.rules = JSON.parse(fs.readFileSync('rules.json', 'utf8'));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/add/plug', route_add_plug);
app.use('/add/switchBle', route_add_switchBle);
app.use('/add/cabinetBle', route_add_cabinetBle);
app.use('/add/ble/plug', route_add_ble_Plug);
app.use('/add/ble/door', route_add_ble_door);
app.use('/add/ble/blind', route_add_ble_blind);

app.use('/plug/del', route_plug_del);
app.use('/plug/status', route_plug_status);
app.use('/plug/turnOn', route_plug_turnOn);
app.use('/plug/turnOff', route_plug_turnOff);

app.use('/switch/del', route_switch_del);
app.use('/switch/status', route_switch_status);

app.use('/ble/plug/del', route_ble_plug_del);
app.use('/ble/plug/status', route_ble_plug_status);
app.use('/ble/plug/turnOn', route_ble_plug_turnOn);
app.use('/ble/plug/turnOff', route_ble_plug_turnOff);

app.use('/ble/door/del', route_ble_door_del);
app.use('/ble/door/turnOn', route_ble_door_turnOn);

app.use('/ble/blind/del', route_ble_blind_del);
app.use('/ble/blind/turnLeft', route_ble_blind_turnLeft);
app.use('/ble/blind/turnRight', route_ble_blind_turnRight);

app.use('/refresh', route_refresh, refreshDevice);
app.use('/refreshRules', route_refreshRules);
app.use('/get/configuration', getConfiguration);

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
							break;
	      		}
	      	}
				}
				//else if(reply.type == 151)
	      	//console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());					
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
      			break;
      		}
      	}
      	for(let dev of app.devices.blePlugs)
      	{
      		if(dev.id == msg.fields.routingKey)
      		{
	      		//console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
      			dev.status = reply.data.data[0];
      			break;
      		}
      	}
				//console.log(reply.data.data);
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

		dev.cmd = [0x01];
		setTimeout(function() {
			sendNotiCmd(dev);
		}, TIMEOUT_SENDCMD);		

		//console.log(dev.id);
	}

	route_switch_monitor(app.devices.blePlugs);
	for (let dev of app.devices.blePlugs){
		dev.status = -1;
		app.ch.bindQueue(app.bleQ.queue, BLE_MQ_EX, dev.id);

		dev.cmd = [0x03];
		setTimeout(function() {
			sendNotiCmd(dev);
		}, TIMEOUT_SENDCMD);		

		//console.log(dev.id);
	}

	route_switch_monitor(app.devices.bleDoors);
	route_switch_monitor(app.devices.bleBlinds);

  app.ch.publish(BLE_MQ_EX, "testmsg", new Buffer("Get my message"));

}

function getConfiguration(req, res, next){
	app.configuration = JSON.parse(fs.readFileSync('configurations.json', 'utf8'));
	res.end(JSON.stringify(app.configuration));
}


function sendNotiCmd(dev){
	route_ble_sendCmd(dev);
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