"use strict"
var constant = require('./../constant');
var express = require('express');
var router = express.Router();
var ble = require('noble');
var bleStatus;
var timeoutVar;
const TIMEOUT = 5 * 1000;
var peripherals = [];
/* GET home page. */
router.post('/', function(req, res, next) {
	console.log("scan ");
	req.on('data', function(data) {
		var reqData = JSON.parse(data);
		console.log(reqData);
		ble = req.app.ble;
		bleStatus = req.app.bleStatus;
		//var serviceUUIDs = ['713d0000503e4c75ba943148f18d941e'];
		peripherals = [];
		ble.startScanning(reqData.serviceUUID);
		ble.once('scanStop', function() {         
			console.log('on -> scanStop');
			res.writeHead(200, {
				'Content-Type' : 'application/json',
				'Content-Length' : Buffer.byteLength(JSON.stringify(peripherals), 'utf8')
			});
			res.write(JSON.stringify(peripherals));
			res.end();
			bleStatus = constant.CONN_STATUS.IDLE;
		});
	});
});

ble.on('discover', function(peripheral) {
	console.log("found a node: ", peripheral.address);
	console.log("advertisment: ", peripheral.advertisement.localName);
	console.log("advertisment: ", peripheral.advertisement.txPowerLevel);
	console.log("advertisment: ", peripheral.advertisement.serviceUuids);
	console.log("rssi: ", peripheral.rssi);
	var peripheralFound = {
		address : peripheral.address,
		localName : peripheral.advertisement.localName,
		txPowerLevel : peripheral.advertisement.txPowerLevel,
		serviceUuids : peripheral.advertisement.serviceUuids,
		rssi : peripheral.rssi
	}
	peripherals.push(peripheralFound);
});

ble.on('scanStart', function() {
	console.log('on -> scanStart');
	bleStatus = constant.CONN_STATUS.SCANNING;

	timeoutVar = setTimeout(function() {
		ble.stopScanning();
	}, TIMEOUT);
});

ble.on('warning', function(message) {
	console.log(message);
});

module.exports = router;
