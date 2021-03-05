'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3000;
var AdminControl = require('./controllers/usuario.controller');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/ControlEmpresas', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conectado a la BD');
        AdminControl.crearAdministrador();
        app.listen(port, () => {
            console.log('Servidor de express corriendo');
        })
    })
    .catch((err) => {
        console.log('Error al conectarse a la BD', err);
    })