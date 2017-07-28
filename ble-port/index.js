"use strict"
const BLE_MQ_EX = "ble-mq-ex";

var amqp = require('amqplib/callback_api');
var express = require('express');
var noble = require('noble');

var constant = require('./constant.js');
var route_scan = require('./routes/route_scan');
var route_connect = require('./routes/route_connect');
var route_delete = require('./routes/route_delete');
var route_sendCmd = require('./routes/route_sendCmd');

var app = express();
app.ble = noble;
app.ble.peripherals = [];
app.bleStatus = constant.CONN_STATUS.IDLE;

app.use('/scan', route_scan);
app.use('/connect', route_connect);
app.use('/delete', route_delete);
app.use('/sendCmd', route_sendCmd);

amqp.connect('amqp://localhost', function(err, conn) {
  if (err != null)
  {
    console.log("Err - no mq server");
    return;
  }

  conn.createChannel(function(err, ch) {
    var ex = BLE_MQ_EX;
    ch.assertExchange(ex, 'topic', {durable: false});
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      app.q = q;
      ch.consume(app.q.queue, function(msg) {
        //var reply = JSON.parse(msg.content);
        console.log(msg);
      }, {noAck: true});
      ch.bindQueue(app.q.queue, BLE_MQ_EX, "testmsg");
    });
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

String.prototype.convertToAddress = function () {
  return this.slice(0,2) + ":" + this.slice(2,4) + ":" + this.slice(4,6) + ":" + this.slice(6,8) + ":" + this.slice(8,10) + ":" + this.slice(10,12);
};

function dataCallBack(data, isNotification){
  var frame = {'data' : data};
  console.log(this._peripheralId.convertToAddress() + " sent to q - " + JSON.stringify(frame));
  app.ch.publish(BLE_MQ_EX, this._peripheralId.convertToAddress(), new Buffer(JSON.stringify(frame)));
};

app.datacb = dataCallBack;
