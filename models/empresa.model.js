'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var empresaSchema = Schema({
    name: String,
    username: String,
    password: String,
    rol: String,
    CantidadDeEmpleados: Number,
    empleado: [{
        name: String,
        puesto: String,
        departamento: String,
    }]
});

module.exports = mongoose.model('empresa', empresaSchema);