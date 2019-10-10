var express = require('express');
var router = express.Router();

var auditor = require('../functions/auditor');

router.use('/', function (req, res, next) {
    auditor.autenticacion(req, res, next);
});

router.post('/obtenercomentarios', function (req, res, next) {
    auditor.obtenercomentarios(req, res, next);
});

router.post('/marcarcomentario', function (req, res, next) {
    auditor.marcarcomentario(req, res, next);
});

router.post('/obtenercursos', function (req, res, next) {
    auditor.obtenercursos(req, res, next);
});

router.post('/avancetemasporcurso', function (req, res, next) {
    auditor.avancetemasporcurso(req, res, next);
});

router.post('/asistenciaporcurso', function (req, res, next) {
    auditor.asistenciaporcurso(req, res, next);
});

router.post('/registrosdiligenciados', function (req, res, next) {
    auditor.registrosdiligenciados(req, res, next);
});

router.post('/nombreasignaturas', function (req, res, next) {
    auditor.nombreasignaturas(req, res, next);
});

router.post('/proyectosdocente', function (req, res, next) {
    auditor.proyectosdocente(req, res, next);
});

module.exports = router;
