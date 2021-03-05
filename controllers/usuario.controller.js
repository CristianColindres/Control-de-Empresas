'use strict'

var Empresa = require('../models/empresa.model');
var Empleado = require('../models/empleado.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var ejs = require("ejs");
var pdf = require("html-pdf");
var path = require("path");

function crearAdministrador(req, res) {
    var empresa = new Empresa();
    Empresa.findOne({ username: 'admin' }, (err, admin) => {
        if (err) {
            console.log('ERROR EN EL SERVIDOR');
        } else if (admin) {
            console.log('ADMIN EXISTENTE');
        } else {
            bcrypt.hash('12345', null, null, (err, passwordHash) => {
                if (err) {
                    res.status(500).send({ message: 'ERROR EN LA ENCRIPTACIÓN DE LA CONTRASEÑA' })
                } else if (passwordHash) {
                    empresa.username = 'admin'
                    empresa.password = passwordHash
                    empresa.rol = 'admin'
                    empresa.save((err, userSaved) => {
                        if (err) {
                            console.log('ERROR AL CREAR');
                        } else if (userSaved) {
                            console.log('ADMIN CREADO');
                        } else {
                            console.log('ADMIN NO CREADO');
                        }
                    })
                }
            })
        }
    })
}

function login(req, res) {
    var params = req.body;

    if (params.username && params.password) {
        Empresa.findOne({ username: params.username.toLowerCase() }, (err, usuarioEncontrado) => {
            if (err) {
                res.status(500).send({ message: 'ERROR EN EL SEVIDOR' })
            } else if (usuarioEncontrado) {
                bcrypt.compare(params.password, usuarioEncontrado.password, (err, checkPassword) => {
                    if (err) {
                        res.status(500).send({ message: 'ERROR EN LA VERIFICACIÓN DE LA CONTRASEÑA' });
                    } else if (checkPassword) {
                        if (params.gettoken) {
                            return res.send({ TOKEN: jwt.createToken(usuarioEncontrado) });
                        } else {
                            return res.send({ message: 'USUARIO LOGEADO EXITOSAMENTE' });
                        }
                    } else {
                        return res.status(404).send({ message: 'CONTRASEÑA INCORRECTA' });
                    }
                })
            } else {
                return res.send({ message: 'USUARIO NO ENCONTRADO' });
            }
        })
    } else {
        return res.status(401).send({ message: 'POR FAVOR INGRESE LOS CAMPOS OBLIGATORIOS' });
    }
}

function saveEmpresa(req, res) {
    var empresa = new Empresa();
    var params = req.body;

    if (params.name && params.username && params.password) {
        Empresa.findOne({ username: params.username }, (err, userFind) => {
            if (err) {
                res.status(500).send({ message: 'ERROR GENERAL', err })
            } else if (userFind) {
                res.status(200).send({ message: 'NOMBRE DE USUARIO YA UTILZADO' })
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                    if (err) {
                        res.status(500).send({ message: 'ERROR EN LA ENCRIPTACIÓN DE LA CONTRASEÑA' })
                    } else if (passwordHash) {
                        empresa.name = params.name
                        empresa.username = params.username.toLowerCase();
                        empresa.password = passwordHash
                        empresa.rol = 'Empresa';
                        empresa.save((err, userSaved) => {
                            if (err) {
                                res.status(500).send({ message: 'ERROR AL GUARDAR LOS DATOS' })
                            } else if (userSaved) {
                                res.status(200).send({ message: 'EMPRESA GUARDADA EXITOSAMENTE' })
                            }
                        })
                    }
                })
            }
        })
    } else {
        res.status(200).send({ message: 'POR FAVOR INGRESE LOS CAMPOS OBLIGATORIOS' })
    }
}

function updateEmpresa(req, res) {
    var update = req.body;
    var userId = req.params.id;

    if (update.password) {
        res.status(500).send({ message: 'NO SE PUEDE MODIFICAR LA CONTRASEÑA' });
    } else {
        if (update.name && update.username) {
            Empresa.findOne({ username: update.username.toLowerCase() }, (err, usernameFind) => {
                if (err) {
                    res.status(500).send({ message: 'ERROR EN EL SERVIDOR' });
                } else if (usernameFind) {
                    res.status(200).send({ message: 'DATO EXISTENTE, NO SE PUEDE ACTUALIZAR' });
                } else {
                    Empresa.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
                        if (err) {
                            res.status(500).send({ message: 'ERROR EN EL SERVIDOR' });
                        } else if (userUpdated) {
                            res.status(200).send({ message: 'EMPRESA ACTUALIZADA', userUpdated });
                        } else {
                            res.status(200).send({ message: 'NO HAY REGISTROS PARA ACTUALIZAR!' });
                        }
                    });
                }
            })
        } else {
            res.status(200).send({ message: 'INGRESE LOS CAMPOS OBLIGATORIOS' })
        }
    }
}

function removeEmpresa(req, res) {
    var userId = req.params.id;

    Empresa.findByIdAndRemove(userId, (err, userRemoved) => {
        if (err) {
            res.status(500).send({ message: 'ERROR EN EL SERVIDOR' });
        } else if (userRemoved) {
            res.status(200).send({ message: 'EMPRESA ELIMINADA', userRemoved });
        } else {
            res.status(200).send({ message: 'NO HAY REGISTROS PARA ELIMINAR' });
        }
    })
}

function setEmpleados(req, res) {
    var empresaId = req.params.id;
    var params = req.body;
    var empleado = new Empleado();

    if (empresaId != req.user.sub) {
        return res.status(500).send({ message: 'ÚNICAMENTE PUEDES AGREGAR EMPLEADOS EN TU EMPRESA' });
    } else {
        Empresa.findById(empresaId, (err, empleadoFind) => {
            if (err) {
                res.status(500).send({ message: 'ERRROR EN EL SERVIDOR' });
            } else if (empleadoFind) {
                if (params.name && params.puesto && params.departamento) {
                    empleado.name = params.name;
                    empleado.puesto = params.puesto.toLowerCase();
                    empleado.departamento = params.departamento.toLowerCase();

                    Empresa.findByIdAndUpdate(empresaId, { $push: { empleado: empleado }, $inc: { CantidadDeEmpleados: +1 } }, { new: true }, (err, empleadoUpdated) => {
                        if (err) {
                            res.status(500).send({ message: 'ERROR GENERAL' });
                        } else if (empleadoUpdated) {
                            res.status(200).send({ message: 'EMPLEADO AGREGADO', empleadoUpdated })
                        } else {
                            res.status(404).send({ message: 'EMPLEADO NO AGREGADO' });
                        }
                    })
                } else {
                    res.status(200).send({ message: 'INGRESE LOS CAMPOS MINIMOS' })
                }
            } else {
                res.status(200).send({ message: 'EMPRESA NO EXISTE' });
            }
        })
    }
}

function updateEmpleados(req, res) {
    var empleadoId = req.params.idEmpleado;
    var empresaId = req.params.idEmpresa;
    var update = req.body;

    if (empresaId == req.user.sub) {
        if (update.name && update.puesto && update.departamento) {
            Empresa.findOne({ _id: empresaId }, (err, userFind) => {
                if (err) {
                    res.status(500).send({ message: 'ERROR GENERAL' });
                } else if (userFind) {
                    Empresa.findOneAndUpdate({ _id: empresaId, 'empleado._id': empleadoId }, {
                        'empleado.$.name': update.name,
                        'empleado.$.puesto': update.puesto.toLowerCase(),
                        'empleado.$.departamento': update.departamento.toLowerCase(),
                    }, { new: true }, (err, userUpdated) => {
                        if (err) {
                            res.status(500).send({ message: 'ERROR GENERAL' });
                        } else if (userUpdated) {
                            res.status(200).send({ message: 'EMPLEADO ACTUALIZADO: ', userUpdated })
                        } else {
                            res.status(404).send({ message: 'CONTACTO NO ACTUALIZADO' })
                        }
                    })
                } else {
                    res.status(200).send({ message: 'NO HAY EMPLEADOS' })
                }
            })
        } else {
            res.status(200).send({ message: 'POR FAVOR INGRESA LOS CAMPOS OBLIGATORIOS' })
        }
    } else {
        res.send({ message: 'ÚNICAMENTE PUEDES ACTUALIZAR EMPLEADOS DE TU EMPRESA' })
    }
}

function removeEmpleados(req, res) {
    var empresaId = req.params.idEmpresa;
    var empleadoId = req.params.idEmpleado;

    if (empresaId == req.user.sub) {
        Empresa.findOneAndUpdate({ _id: empresaId, 'empleado._id': empleadoId }, { $pull: { empleado: { _id: empleadoId } } }, { new: true }, (err, empleadoRemove) => {
            if (err) {
                res.status(500).send({ message: 'ERROR GENERAL' });
            } else if (empleadoRemove) {
                Empresa.findByIdAndUpdate(empresaId, { $inc: { CantidadDeEmpleados: -1 } }, { new: true }, (err, empleadoRemove) => {
                    if (err) {
                        res.status(500).send({ message: 'ERROR GENERAL' });
                    } else if (empleadoRemove) {
                        res.status(200).send({ message: 'EMPLEADO ELIMINADO: ', empleadoRemove });
                    }
                })
            } else {
                res.status(200).send({ message: 'EL EMPLEADO NO EXISTE O YA FUE ELIMINADO' });
            }
        })
    } else {
        res.send({ message: 'ÚNICAMENTE PUEDES ELIMINAR EMPLEADOS DE TU EMPRESA' })
    }
}

function search(req, res) {

    Empresa.aggregate([
        { $match: { 'username': req.user.username } },
        { $unwind: '$empleado' },
        {
            $match: {
                $or: [{ 'empleado.name': req.body.search },
                    { 'empleado.puesto': req.body.search.toLowerCase() },
                    { 'empleado.departamento': req.body.search.toLowerCase() }
                ]
            }
        },
        { "$group": { _id: req.user.sub, empleado: { "$push": "$empleado" } } }
    ]).exec((err, empleado) => {
        if (err) {
            res.status(500).send({ message: 'ERROR EN EL SERVIDOR' });
        } else if (empleado) {
            res.status(200).send({ COINCIDENCIAS: empleado })
        } else {
            res.status(404).send({ empleado: 'SIN REGISTROS' });
        }
    })
}

function busquedaPorId(req, res) {
    var empleadoId = req.params.idEmpleado;
    var empresaId = req.params.idEmpresa;

    if (empresaId == req.user.sub) {
        Empresa.findOne({ _id: empresaId }, { empleado: { $elemMatch: { _id: empleadoId } } }).exec((err, empleado) => {
            if (err) {
                res.status(500).send({ message: 'ERROR GENERAL' });
            } else if (empleado) {
                res.send({ message: 'EMPLEADOS:', empleados: empleado.empleado })
            } else {
                res.status(404).send({ message: 'SIN REGISTROS' });
            }
        })
    } else {
        res.send({ message: 'ÚNICAMENTE PUEDES VISUALIZAR LOS EMPLEADOS DE TU EMPRESA' });
    }
}

function createPDF(req, res) {
    var empresaId = req.params.idEmpresa;

    if (empresaId == req.user.sub) {
        Empresa.findOne({ _id: empresaId }).exec((err, empleados) => {
            if (err) {
                res.status(500).send({ message: 'ERROR EN EL SERVIDOR' })
            } else if (empleados) {
                ejs.renderFile(path.join('./view/', 'vista.ejs'), { empleados: empleados.empleado }, (err, data) => {
                    if (err) {
                        res.send(err);
                    } else {
                        let options = {
                            "height": "15in",
                            "width": "12in",
                            "header": {
                                "height": "20mm"
                            },
                            "footer": {
                                "height": "20mm",
                            },
                        };

                        pdf.create(data, options).toFile("ReporteEmpleados.pdf", function(err, data) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.send("ARCHIVO PDF CREADO")
                            }
                        });
                    }
                });
            } else {
                res.status(404).send({ message: 'SIN REGISTROS' })
            }
        })
    } else {
        res.send({ message: 'ÚNICAMENTE PUEDES CREAR EL ARCHIVO PDF DE TU EMPRESA' })
    }
}

module.exports = {
    crearAdministrador,
    login,
    saveEmpresa,
    updateEmpresa,
    removeEmpresa,
    setEmpleados,
    updateEmpleados,
    removeEmpleados,
    search,
    busquedaPorId,
    createPDF
}