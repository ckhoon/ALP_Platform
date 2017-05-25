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
		//ble.startScanning(reqData.serviceUuid);
		ble.startScanning();

		ble.once('scanStart', function() {
			console.log('on -> scanStart by scan');
			bleStatus = constant.CONN_STATUS.SCANNING;

			timeoutVar = setTimeout(function() {
				ble.stopScanning();
			}, TIMEOUT);
		});		

		ble.on('discover', function(peripheral) {
			console.log("found a node: ", peripheral.address);
			console.log("advertisment: ", peripheral.advertisement.localName);
			console.log("advertisment: ", peripheral.advertisement.txPowerLevel);
			console.log("advertisment: ", peripheral.advertisement.serviceUuids);
			console.log("rssi: ", peripheral.rssi);
			if(peripheral.advertisement.localName){
				console.log(peripheral.advertisement.localName.includes(reqData.localName));
				if (peripheral.advertisement.localName.includes(reqData.localName)){
					console.log("advertisment: ", peripheral.advertisement.localName);
					var peripheralFound = {
						address : peripheral.address,
						localName : peripheral.advertisement.localName,
						txPowerLevel : peripheral.advertisement.txPowerLevel,
						serviceUuids : peripheral.advertisement.serviceUuids,
						rssi : peripheral.rssi
					}
					peripherals.push(peripheralFound);				
				}
			}
		});		

		ble.once('scanStop', function() {         
			console.log('on -> scanStop');
			ble.removeAllListeners('discover');
			ble.removeAllListeners('warning');
			res.writeHead(200, {
				'Content-Type' : 'application/json',
				'Content-Length' : Buffer.byteLength(JSON.stringify(peripherals), 'utf8')
			});
			res.write(JSON.stringify(peripherals));
			res.end();
			bleStatus = constant.CONN_STATUS.IDLE;
		});

		ble.on('warning', function(message) {
			console.log(message);
		});
	});
});



module.exports = router;
