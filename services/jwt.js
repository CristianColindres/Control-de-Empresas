'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-IN6AM@';

exports.createToken = (user) => {
    var playload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        lastname: user.lastname,
        rol: user.rol,
        CantidadDeEmpleados: user.CantidadDeEmpleados,
        iat: moment().unix(),
        exp: moment().add(2, 'hours').unix()
    }
    return jwt.encode(playload, secretKey);
}