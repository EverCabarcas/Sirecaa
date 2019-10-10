var express = require('express');
var router = express.Router();

var estudiante = require('../functions/estudiante');

router.use('/', function (req, res, next) {
    estudiante.autenticacion(req, res, next);
});

router.post('/crearcomentario', function (req, res, next) {
    estudiante.crearcomentario(req, res, next);
});

router.post('/obtenercomentarios', function (req, res, next) {
    estudiante.obtenercomentarios(req, res, next);
});

router.post('/editarcomentario', function (req, res, next) {
    estudiante.editarcomentario(req, res, next);
});

router.post('/eliminarcomentario', function (req, res, next) {
    estudiante.eliminarcomentario(req, res, next);
});

module.exports = router;
