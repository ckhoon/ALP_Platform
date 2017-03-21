"use strict"

var express = require('express');
var router = express.Router();

router.post('/', function(req, res){
	req.on('data', function(data) {
		var reqPlug = JSON.parse(data);

		var status = -1;

		for (let plug of req.app.devices.plugs){
			if (plug.id == reqPlug.id)
				if(typeof plug.status != 'undefined')
				{
					status = plug.status;
					break;
				}
		}
		res.send({'status' : status});
		res.end();
  });
});

module.exports = router;