var express = require('express');
var router = express.Router();
var curso = require('../models/curso');
var jwt = require('jsonwebtoken');
var horario = require('../models/horario');

router.use('/', function (req, res, next) {
    jwt.verify(req.query.token_sirecaa, 'sirecaa_secret', function (err, decoded) {
        if (err) {
            return res.status(401).json({
                title: 'No Autenticado',
                error: err
            });
        }
        next();
    })
});

router.post('/validaregistros', function (req, res, next) {
    var now= new Date(); // Conseguimos los datos de Ahora
    var nowday= now.getDate();  // Que dia estamos
    var nowhour= now.getHours();  // Hora actual
    var nowminute= now.getMinutes(); // Minuto actual
    var nowsecond= now.getSeconds();  // Segundo actual
    var nowanno = now.getFullYear();
    var nowmonth = now.getMonth();
    var tiempo2 = new Date(nowanno,nowmonth, nowday, nowhour, nowminute, nowsecond, 0);
    var asignaturas = [];
    var Segundos_entre_fechas;

    horario.find({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo, periodo: req.body.periodo, anno: req.body.anno}, function (err, horarios) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar los horarios '+err
            });
        }
        if(!horarios.length){
            return res.status(500).json({
                mensaje: 'No hay horarios asociados a este curso'
            });
        }
        for(var i = 0; i < horarios.length; i++) {
            if (horarios[i].registro == false) {
            var hym = horarios[i].h_inicio.split(':');

            var fecha = horarios[i].fecha.split('-');
             //var m = parseInt(fecha[1], 10);
            var tiempo1 = new Date(parseInt(fecha[0]),parseInt(fecha[1]) -1, parseInt(fecha[2]), parseInt(hym[0]), parseInt(hym[1]), 0);

            var dif = tiempo1.getTime() - tiempo2.getTime();

            var Segundos_de_T1_a_T2 = dif / 1000;

            var Segundos_entre_fechas = Math.abs(Segundos_de_T1_a_T2);
            if ((Segundos_entre_fechas <= 172800) && (horarios[i].registro == false)) {
                asignaturas.push(horarios[i])
            }
            hym = [];
            fecha = [];
        }
        }

        res.status(200).json({
           message : asignaturas
        });
    });
});
module.exports = router;