"use strict"

var path = require('path');
var express = require('express');
var app = express();
var index = require('./routes/route_index');
var route_add_plug = require('./routes/route_add_plug');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/add/plug', route_add_plug);

app.use('/test', test);

// production error handler
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