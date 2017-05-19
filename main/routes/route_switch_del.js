"use strict"

var express = require('express');
var router = express.Router();
var fs = require('fs');

router.post('/', function(req, res){
	console.log("del switch - ");
	req.on('data', function(data) {
		var reqDev = JSON.parse(data);
		var status = -1;
		console.log(reqDev);
		for (let dev of req.app.devices.switches){
			if (dev.id == reqDev.id)
			{
				var index = req.app.devices.switches.indexOf(dev);
				console.log(index);
				if (index != -1){
					status = index;
					req.app.devices.switches.splice(index, 1);
					console.log(req.app.devices);
					fs.writeFile ("devices.json", JSON.stringify(req.app.devices, null, 2), function(err) {
						if (err) {
							console.log(err);
							throw err;
						}
					});
					console.log("done");
				}
			}
		}
		res.send({'status' : status});
		res.end();
  });
});

module.exports = router;