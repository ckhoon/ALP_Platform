"use strict"
var constant = require('./../constant');
var express = require('express');
var router = express.Router();
var ble = require('noble');
var bleStatus;
var timeoutVar;
/* GET home page. */
router.get('/', function(req, res, next) {
	ble = req.app.ble;
	bleStatus = req.app.bleStatus;
	var serviceUUIDs = ['713d0000503e4c75ba943148f18d941E'];
	ble.startScanning(serviceUUIDs);
});

ble.on('discover', function(peripheral) {
	console.log("found a node: ", peripheral.address);
	console.log("advertisment: ", peripheral.advertisement.localName);
	console.log("advertisment: ", peripheral.advertisement.txPowerLevel);
	console.log("advertisment: ", peripheral.advertisement.serviceUuids);
	console.log("rssi: ", peripheral.rssi);
	console.log(peripheral);
/*
	if (peripheral.advertisement.localName == "BT_MC\0")
	{
		console.log("BT_MC found");
		ble.peripheral = peripheral;
		clearTimeout(timeoutVar);
		noble.stopScanning();
	}
	else
	{
		console.log("localName doesnt match - ", peripheral.advertisement.localName);		
	}
	*/
});

ble.on('scanStart', function() {
	console.log('on -> scanStart');
	bleStatus = constant.CONN_STATUS.SCANNING;

	timeoutVar = setTimeout(function() {
		ble.stopScanning();
	}, 5 * 1000);
});

ble.on('scanStop', function() {         
	console.log('on -> scanStop');
	/*
	if (ble.peripheral.uuid){
//		console.log(ble.peripheral);
		ble.peripheral.connect(function(error) {
			if (error)
			{
				console.log(error);
				current_status = constant.CONN_STATUS.IDLE;
			}
			else
			{
				console.log('connected to peripheral: ' + ble.peripheral.uuid);

			    ble.peripheral.discoverServices(null, function(error, services) {
					if (error){
						console.log(error);
						current_status = constant.CONN_STATUS.IDLE;
					}
			    	else{
						console.log('discovered the following services:');
						for (var i in services) {
							console.log('  ' + i + ' uuid: ' + services[i].uuid);
							if (services[i].uuid == '6e400001b5a3f393e0a9e50e24dcca9e'){
								console.log("Uart service found!");
								ble.service = services[i];
								ble.service.discoverCharacteristics(null, function(error, characteristics){
									console.log('discovered the following characteristics:');
									for (var j in characteristics) {
										console.log('  ' + j + ' uuid: ' + characteristics[j].uuid);
										if (characteristics[j].uuid == '6e400002b5a3f393e0a9e50e24dcca9e'){
											console.log("TX characteristics found!");
											ble.uartTx = characteristics[j];
										}else if(characteristics[j].uuid == '6e400003b5a3f393e0a9e50e24dcca9e'){
											console.log("RX characteristics found!");
											ble.uartRx = characteristics[j];

											ble.uartRx.on('read', uartRxData);

											ble.uartRx.notify(true, function(error) {
												console.log('RX notification on');
											});
											current_status = constant.CONN_STATUS.CONNECTED;
										}
									}
								});
							}
						}			      	
					}
				});				
			}
		});

		ble.peripheral.on('disconnect', disconnected);

	}
	else
		current_status = constant.CONN_STATUS.IDLE;
	*/
		bleStatus = constant.CONN_STATUS.IDLE;
});

ble.on('warning', function(message) {
	console.log(message);
});

module.exports = router;
