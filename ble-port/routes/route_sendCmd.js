"use strict"
var constant = require('./../constant');
var express = require('express');
var router = express.Router();
var ble = require('noble');

/* GET home page. */
router.post('/', function(req, res, next) {

	console.log("send command ");

	req.on('data', function(data) {
		var reqDev = JSON.parse(data);

		console.log(reqDev);
		for (let peripheral of req.app.ble.peripherals){
			//console.log(peripheral.address + " match " + reqDev.id);
			if(reqDev.id == peripheral.address){
				console.log(reqDev.cmd);
				if (peripheral.txChara){
					//peripheral.txChara.write(new Buffer([0x01]), false, function(error) {
					peripheral.txChara.write(new Buffer(reqDev.cmd), false, function(error) {
						if(error) {
							console.log(error);
						}
						else{
							console.log('send cmd');
						}
					});
				}else{
					console.log ('no tx chara to send cmd!');
				}
				break;
			}
		}
		res.end();
	});
});

module.exports = router;
