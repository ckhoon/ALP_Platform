"use strict"

var path = require('path');
var express = require('express');
var app = express();
var index = require('./routes/route_index');
var demo = require('./routes/route_demo');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/node_modules', express.static(__dirname + '/node_modules'));
//app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/demo', demo);

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port = 3000; 
app.listen(port);
console.log("Listening on port " + port);