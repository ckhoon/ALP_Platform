"use strict"
var constant = require('./../constant');
var express = require('express');
var router = express.Router();
var ble = require('noble');

var timeoutVar;
var peripherals = [];
const TIMEOUT = 5 * 1000;
const TIMEOUT_SERV = 1 * 1000;
const TIMEOUT_IDLE = 1 * 1000;

/* GET home page. */
router.post('/', function(req, res, next) {
	console.log("connect ");
	req.on('data', function(data) {
		var reqDevs = [];
		var reqData = JSON.parse(data);
		if (reqData.constructor === Array)
			reqDevs = reqData;
		else
			reqDevs.push(reqData);

		var nonConnectedDevs = getNonConnectedDevs(req.app.ble.peripherals, reqDevs);
		
		if (nonConnectedDevs.length != 0){

			//var serviceUUIDs = ['713d0000503e4c75ba943148f18d941e'];
			//ble.startScanning(serviceUUIDs);

			waitForScan(req, nonConnectedDevs, res);


		}
	});
});

function getNonConnectedDevs(peripherals, reqDevs){
	var nonConDevs = [];

	for (let dev of reqDevs){
		var found = false;
		for (let peripheral of peripherals){
//			console.log(peripheral.address + " match " + dev.id);
			if(dev.id == peripheral.address){
				found = true;

/*
				if (peripheral.txChara){
					peripheral.txChara.write(new Buffer([0x01]), false, function(error) {
						if(error) {
							console.log(error);
						}
						else{
							console.log('send cmd');
						}
					});
				}
*/

				break;
			}
		}
		if (!found)
			nonConDevs.push(dev);
	}
	return nonConDevs;
}

function onDisconnect(err){
	console.log("disconnect ??? " + this);
	for (let dev of ble.peripherals){
		if (dev.address == this.address)
		{
			var index = ble.peripherals.indexOf(dev);
			if (index != -1){
				ble.peripherals.splice(index, 1);
			}
		}
	}
}

function onConnect(bleFound, nonConnDev, req){
	console.log("connected. now finding - " + nonConnDev.serviceUuid);
	timeoutVar = setTimeout(function() {
		bleFound.discoverServices(nonConnDev.serviceUuid ,function(err, services){
			//console.log(services);
			if(services[0]){
				if (services[0].uuid == nonConnDev.serviceUuid){
					bleFound.service = services[0];
					bleFound.service.discoverCharacteristics(null, function(error, characteristics){
						//console.log(characteristics);
						for (let charac of characteristics){
							for(let prop of charac.properties){
								if (prop == 'notify'){
									bleFound.rxChara = charac;
									charac.notify(true, function(err){
										console.log('notification on');
/*
										setTimeout(function(){
											if (bleFound.txChara){
												bleFound.txChara.write(new Buffer([0x01]), false, function(error) {
													if(error) {
														console.log(error);
													}
													else{
														console.log('send cmd');
													}
												});
											}
										}, 1000);
*/
									});
									charac.subscribe();
									charac.on('data', req.app.datacb);
								}
								else if(prop == 'writeWithoutResponse')
								{
									bleFound.txChara = charac;
								}
							}
						}
					});
				}
			}
		});
	}, TIMEOUT_SERV);
}

function waitForScan(req, nonConnectedDevs, res){
	if(req.app.bleStatus != constant.CONN_STATUS.IDLE){
		console.log(" i will wait");
		setTimeout(function() {
			waitForScan(req, nonConnectedDevs, res);
		}, TIMEOUT_IDLE);		
	}else{

		ble = req.app.ble;

		ble.startScanning();
		req.app.bleStatus = constant.CONN_STATUS.SCANNING;
		peripherals = [];

		ble.once('scanStart', function() {
			console.log('on -> scanStart by connect');
			timeoutVar = setTimeout(function() {
				ble.stopScanning();
			}, TIMEOUT);
		});

		ble.on('discover', function(peripheral) {
			console.log("found a node: ", peripheral.address);
			console.log("advertisment: ", peripheral.advertisement.localName);
			//console.log("advertisment: ", peripheral.advertisement.txPowerLevel);
			//console.log("advertisment: ", peripheral.advertisement.serviceUuids);
			//console.log("rssi: ", peripheral.rssi);
			peripherals.push(peripheral);
		});

		ble.on('warning', function(message) {
			console.log(message);
		});

		ble.once('scanStop', function() {
			console.log('on -> scanStop by connect');
			ble.removeAllListeners('discover');
			ble.removeAllListeners('warning');

			for (let bleFound of peripherals){
				for (let nonConnDev of nonConnectedDevs){
					//console.log(bleFound.address + " == " + nonConnDev.id);
					if (bleFound.address == nonConnDev.id)
					{
						ble.peripherals.push(bleFound);
						//ble.peripherals[ble.peripherals.length-1]
						//console.log(ble.peripherals[ble.peripherals.length-1].address + " == " + nonConnDev.id);

						bleFound.once('disconnect', onDisconnect);

						bleFound.connect(function(error){
							onConnect(bleFound, nonConnDev, req);
						});

						console.log("break");
						break;
					}
				}
			}
			res.end();
			req.app.bleStatus = constant.CONN_STATUS.IDLE;
		});			

	}
}

module.exports = router;
