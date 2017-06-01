"use strict"

var express = require('express');
var router = express.Router();

router.post('/', function(req, res){
	req.on('data', function(data) {
		var reqDev = JSON.parse(data);
		var status = -1;


		for (let dev of req.app.devices.switches){
			//console.log (reqDev.id + " == " + dev.id);
			if (dev.id == reqDev.id)
			{
				//console.log(dev);
				if(typeof dev.status != 'undefined')
				{
					status = dev.status;
					break;
				}
			}
		}

		res.send({'status' : status});
		res.end();
  });
});

module.exports = router;