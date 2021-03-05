'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-IN6AM@';

exports.ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'LA PETICIÓN NO LLEVA CABECERA DE AUTENTIFICACIÓN' })
    } else {
        var token = req.headers.authorization.replace(/['"']+/g, '');
        try {
            var payload = jwt.decode(token, secretKey);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: 'EL TOKEN HA EXPIRADO' })
            }
        } catch (err) {
            return res.status(404).send({ message: 'TOKEN INVÁLIDO' })
        }
        req.user = payload;
        next();
    }
}

exports.ensureAuthAdmin = (req, res, next) => {
    var payload = req.user;

    if (payload.rol != 'admin') {
        return res.status(404).send({ message: 'NO TIENES PERMISO PARA INGRESAR A ESTA RUTA' })
    } else {
        return next();
    }
}

exports.ensureAuthEmpresa = (req, res, next) => {
    var payload = req.user;

    if (payload.rol != 'Empresa') {
        return res.status(404).send({ message: 'NO TIENES PERMISO PARA INGRESAR A ESTA RUTA' })
    } else {
        return next();
    }
}