var express = require('express');
var router = express.Router();
var administrador = require('../functions/administrador');

router.use('/', function (req, res, next) {
    administrador.autenticacion(req, res, next);
});

router.post('/asignaturainfo', function (req, res, next) {
    administrador.asignaturainfo(req, res, next);
});

router.post('/getDisponibility', (req, res, next) =>{
    administrador.getDisponibility(req, res, next);
});

router.post('/setDisponibility', (req, res, next) =>{
    administrador.setDisponibility(req, res, next);
});

router.post('/areainfo', function (req, res, next) {
    administrador.areainfo(req, res, next);
});

router.post('/proyectodocenteinfo', function (req, res, next) {
    administrador.proyectodocenteinfo(req, res, next);
});

router.post('/proyectodocente', function (req, res, next) {
    administrador.proyectodocente(req, res, next);
});

router.post('/iniciarperiodoacademico', function (req, res, next) {
    administrador.iniciarperiodoacademico(req, res, next);
});

router.post('/estadodelperiodo',function (req, res, next) {
    administrador.estadodelperiodo(req, res, next);
});

router.post('/modificaciondelperiodo',function (req, res, next) {
    administrador.modificaciondelperiodo(req, res, next);
});

router.post('/listaproyectosdocente', function (req, res, next) {
    administrador.listaproyectosdocente(req, res, next);
});

router.post('/asignarproyectodocente', function (req, res, next) {
    administrador.asignarproyectodocente(req, res, next);
});

router.post('/cursosdeunproyecto', function (req, res, next) {
    administrador.cursosdeunproyecto(req, res, next);
});

router.post('/temasdeunproyecto', function (req, res ,next) {
    administrador.temasdeunproyecto(req, res, next);
});

router.post('/creararea', function (req, res, next) {
    administrador.creararea(req, res, next);
});

router.post('/docentesdeunprograma', function (req, res, next){//
    administrador.docentesdeunprograma(req, res, next);
});

router.post('/cursosdeunprograma', function (req, res, next) {
    administrador.cursosdeunprograma(req, res, next);
});

router.post('/asignarptoyectoavarios', function (req, res, next) {
    administrador.asignarptoyectoavarios(req, res, next);
});

router.post('/obtenerareas', function (req, res, next) {
    administrador.obtenerareas(req, res, next);
});

router.post('/asignararea', function (req, res, next) {
   administrador.asignararea(req, res, next);
});

router.post('/asignarareaavarios', function (req, res, next) {
    administrador.asignarareaavarios(req, res, next);
});

router.post('/cursosdeunarea', function (req, res, next) {
    administrador.cursosdeunarea(req, res, next);
});

router.post('/crearauditorgeneral', function (req, res, next) {
    administrador.crearauditorgeneral(req, res, next);
});

router.post('/eliminarauditorgeneral', function (req, res, next) {
    administrador.eliminarauditorgeneral(req, res, next);
});

router.post('/auditoresgeneralesprograma', function (req, res, next) {
    administrador.auditoresgeneralesprograma(req, res, next);
});

router.post('/desvinculararea', function (req, res, next) {
    administrador.desvinculararea(req, res, next);
});

router.post('/editararea', function (req, res, next) {
    administrador.editararea(req, res, next);
});

router.post('/eliminararea', function (req, res, next) {
    administrador.eliminararea(req, res, next);
});

router.post('/desvincularproyectodocente', function (req, res, next) {
    administrador.desvincularproyectodocente(req, res, next);
});

router.post('/editarproyectodocente', function (req, res, next) {
    administrador.editarproyectodocente(req, res, next);
});

router.post('/eliminarproyectodocente', function (req, res, next) {
    administrador.eliminarproyectodocente(req, res, next);
});

router.post('/editartema', function (req, res, next) {
    administrador.editartema(req, res, next);
});

router.post('/eliminartema', function (req, res, next) {
    administrador.eliminartema(req, res, next);
});

router.post('/nuevotema', function (req, res, next) {
    administrador.nuevotema(req, res, next);
});

router.post('/sincronizacion', function (req, res, next) {
    administrador.sincronizacion(req, res, next);
});




module.exports = router;
