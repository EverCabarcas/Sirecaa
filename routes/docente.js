var express = require('express');
var router = express.Router();

var docente = require('../functions/docente');

router.use('/', function (req, res, next) {
    docente.autenticacion(req, res, next);
});

router.post('/getcursosdocente', function (req, res, next) {
    docente.getcursosdocente(req, res, next);
});

router.post('/validaregistros', function (req, res, next) {
    docente.validaregistros(req, res, next);
});

router.post('/crearregistro', function (req, res, next) {
    docente.crearregistro(req, res, next);
});

module.exports = router;