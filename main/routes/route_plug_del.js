"use strict"

var express = require('express');
var router = express.Router();
var fs = require('fs');

router.post('/', function(req, res){
	console.log("del plug - ");
	req.on('data', function(data) {
		var reqPlug = JSON.parse(data);
		var status = -1;
		console.log(reqPlug);
		for (let plug of req.app.devices.plugs){
			if (plug.id == reqPlug.id)
			{
				var index = req.app.devices.plugs.indexOf(plug);
				console.log(index);
				if (index != -1){
					status = index;
					req.app.devices.plugs.splice(index, 1);
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