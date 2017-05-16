"use strict"
const BLE_MQ_EX = "ble-mq-ex";

var amqp = require('amqplib/callback_api');
var express = require('express');
var noble = require('noble');

var constant = require('./constant.js');
var route_scan = require('./routes/route_scan');

var app = express();
app.ble = noble;
app.bleStatus = constant.CONN_STATUS.IDLE;

app.use('/scan', route_scan);

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = BLE_MQ_EX;
    ch.assertExchange(ex, 'topic', {durable: false});
    app.ch = ch;
  });
});

app.ble.on('stateChange', function(state) {
	if (state === 'poweredOn') {
		app.bleStatus = constant.CONN_STATUS.IDLE;
		console.log("BLE on!");
	}
});

var server = app.listen(5000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("ble app listening at " + port)
});


