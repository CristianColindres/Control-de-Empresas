'use strict'

var express = require('express');
var usuarioController = require('../controllers/usuario.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/login', usuarioController.login);
api.post('/saveEmpresa', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], usuarioController.saveEmpresa);
api.put('/updateEmpresa/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], usuarioController.updateEmpresa);
api.delete('/removeEmpresa/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], usuarioController.removeEmpresa);

api.put('/:id/setEmpleados', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpresa], usuarioController.setEmpleados);
api.put('/:idEmpleado/updateEmpleados/:idEmpresa', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpresa], usuarioController.updateEmpleados);
api.put('/:idEmpleado/removeEmpleados/:idEmpresa', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpresa], usuarioController.removeEmpleados);

api.put('/search', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpresa], usuarioController.search);
api.get('/:idEmpleado/busquedaPorId/:idEmpresa', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpresa], usuarioController.busquedaPorId);
api.get('/createPDF/:idEmpresa', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpresa], usuarioController.createPDF);

module.exports = api;