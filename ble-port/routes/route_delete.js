"use strict"
var constant = require('./../constant');
var express = require('express');
var router = express.Router();
var ble = require('noble');

/* GET home page. */
router.post('/', function(req, res, next) {

	console.log("delete ");

	req.on('data', function(data) {
		var reqDev = JSON.parse(data);

		console.log(reqDev);
		for (let peripheral of req.app.ble.peripherals){
			console.log(peripheral.address + " match " + reqDev.id);
			if(reqDev.id == peripheral.address){
				peripheral.disconnect(function(error) {
					console.log('disconnected from peripheral: ' + peripheral.address);
    		});
			}
			break;
		}
		res.end();
	});
});

module.exports = router;
