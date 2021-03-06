'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var userRoutes = require('./routes/usuario.route');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DEvarE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DEvarE');
    next();
});

app.use('/v1', userRoutes);

module.exports = app;