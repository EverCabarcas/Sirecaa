var express = require('express');
var router = express.Router();

var sistema = require('../functions/sistema');

router.use('/', function (req, res, next) {
    sistema.autenticacion(req, res, next);
});

router.post('/annomenor', function (req, res, next) {
    sistema.annomenor(req, res, next);
});

router.post('/nombreasignaturas', function (req, res, next) {
    sistema.nombreasignaturas(req, res, next);
});

router.post('/obtenerregistros', function (req, res, next) {
    sistema.obtenerregistros(req, res, next);
});

router.post('/obtenerhorario', function (req, res, next) {
    sistema.obtenerhorario(req, res, next);
});

router.post('/obtenertemasvistos', function (req, res, next) {
    sistema.obtenertemasvistos(req, res, next);
});

router.post('/obtenerasistencia', function (req, res, next) {
    sistema.obtenerasistencia(req, res, next);
});

router.post('/createtransactions', function (req, res, next) {
    sistema.createtransactions(req, res, next);
});

router.get('/obtenertransactions', function (req, res, next) {
    sistema.obtenertransactions(req, res, next);
});


module.exports = router;