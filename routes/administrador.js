var express = require('express');
var router = express.Router();
var curso = require('../models/curso');
var area = require('../models/area');
var proyecto_docente = require('../models/proyecto_docente');
var Horario = require('../models/horario');
var Tema = require('../models/tema');
var date = new Date();
var jwt = require('jsonwebtoken');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;



router.use('/', function (req, res, next) {
    jwt.verify(req.query.token_sirecaa, 'sirecaa_secret', function (err, decoded) {
        if (err) {
            return res.status(401).json({
                message: 'No Autenticado '+err
            });
        }
        next();
    })
});
router.post('/asignaturainfo', function (req, res, next) {
    curso.findOne({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo}, function (err, c) {
        if(!c){
            return res.status(500).json({
                message : 'Curso no encontrado'
            });
        }
        if(err){
            return res.status(400).json({
                message : 'Error en la operacion '+err
            });
        }
        res.status(200).json({
            fetchcurso : c
        });
    });
});

router.post('/areainfo', function (req, res, next) {
    area.findById(req.body.id_area, function (err, area) {
        if(!area){
            return res.status(500).json({
                message : 'Area no encontrada'
            });
        }
        if(err){
            return res.status(400).json({
                message : 'Error en la operacion '+err
            });
        }
        res.status(200).json({
            nombre : area.nombre,
            id_docente : area.id_docente
        });
    });
});

router.post('/proyectodocenteinfo', function (req, res, next) {
    proyecto_docente.findById(req.body.id_proyecto, function (err, proyecto) {
        if(!proyecto){
            return res.status(500).json({
                message : 'Proyecto Docente no encontrado'
            });
        }
        if(err){
            return res.status(400).json({
                message : 'Error en la operacion '+err
            });
        }
            Tema.find({id_proyecto: req.body.id_proyecto}, function (err, temas) {
                if(!temas){
                    return res.status(500).json({
                        message : 'El Proyecto Docente no tiene temas asociados'
                    });
                }
                if(err){
                    return res.status(400).json({
                        message : 'Error en la operacion '+err
                    });
                }
                res.status(200).json({
                    objetivos : proyecto.objetivos,
                    competencias: proyecto.competencias,
                    bibliografia: proyecto.bibliografia,
                    temas: temas
                });
            });

    })
});

router.post('/proyectodocente', function (req, res, next) {
    var proyecto = new proyecto_docente({
        objetivos: req.body.objetivos,
        competencias: req.body.competencias,
        bibliografia: req.body.bibliografia,
        fecha_inicio: ''+(date.getDay())+'/'+(date.getMonth()+1)+'/'+date.getFullYear(), // milisegundos
        fecha_fin: ''+(date.getDay())+'/'+((date.getMonth()+1)+6)+'/'+date.getFullYear()
    });
    proyecto.save(function (err, result) {
        if (err) {
            return res.status(500).json({
                message: 'Un error a ocurrido '+err
            });
        }
        for(var i =0; i< req.body.temas.length; i++){
            var tema = new Tema({
                id_proyecto : result._id,
                nombre: req.body.temas[i].nombre,
                visto: req.body.temas[i].visto
            });
            tema.save();
        }

        res.status(201).json({
            message: 'Proyecto Docente Creado',
            resultado: result
        });

    });
});

router.post('/asignaturasprograma', function (req, res, next) {

    var url = "http://190.242.62.234:8080/SIRECAARST/programacion/xprograma";
    var method = "POST";
    var postData = 'id_programa='+req.body.id_programa+'&anno='+req.body.anno+'&periodo='+req.body.periodo+'&token='+req.body.token_udc;

    var async = true;

    var request = new XMLHttpRequest();

    request.onload = function () {

        var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
        var data = JSON.parse(this.responseText); // Returned data, e.g., an HTML document.
        if (status != 200) {
            return res.status(status).json({
                message: 'Error de peticion: ' + status
            });
        }

        curso.count(function (err, count) {
            if (err) {
                return res.status(500).json({
                    message: 'error en la comparacion de asignaturas de nuestra bd con la de udc' + err
                });
            }
            if (count == 0) {
                for (var i = 0; i < data.length; i++) {
                    var c = new curso({
                        id_asignatura: data[i].id_asignatura,
                        grupo: data[i].grupo,
                        nombre: data[i].nombre_asignatura,
                        id_proyecto: 'vacio',
                        id_area: 'vacio'
                    });
                    c.save(function (err, respuesta) {
                        if (err) {
                            return res.status(500).json({
                                message: 'error al guardar los horarios' + err
                            });
                        }
                        horario(respuesta, req, res);
                    });
                }
                return res.status(200).json({
                    message: 'Periodo academico iniciado con exito : Falta el nombre de la asignatura'
                });
            }
            if (count != 0){
                var a;
                for ( var j = 0; j < data.length; j++) {
                    curso.find({
                        id_asignatura: "IA08106",
                        grupo: "A"
                    }, function(err,resultado) {
                        if (err) {
                            return res.status(500).json({
                                message: 'error al guardar los horarios' + err
                            });
                        }

                            a = resultado;


                    });
                    res.status(500).json({
                        message: a
                    });

                        /*var co = new curso({
                            id_asignatura: data[j].id_asignatura,
                            grupo: data[j].grupo,
                            nombre: data[j].nombre_asignatura,
                            id_proyecto: 'vacio',
                            id_area: 'vacio'
                        });
                        co.save(function (err, respuesta) {
                            if(err){
                                return res.status(500).json({
                                    message: 'error al guardar los horarios' + err
                                });
                            }
                            horario(respuesta,req, res);
                        });*/


                }
        }

        });
    };
    request.open(method, url, async);

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    request.send(postData);

});

function horario(respuesta, req, res) {
    var url = "http://190.242.62.234:8080/SIRECAARST/programacion/horario";
    var method = "POST";
    var postData = 'id_asignatura='+respuesta.id_asignatura+'&grupo='+respuesta.grupo+'&anno='+req.body.anno+'&periodo='+req.body.periodo+'&token='+req.body.token_udc;

    var async = true;

    var request = new XMLHttpRequest();

    request.onload = function () {

        var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
        var data = JSON.parse(this.responseText); // Returned data, e.g., an HTML document.
        if (status != 200) {
            return res.status(status).json({
                message: 'Error de peticion: ' + status
            });
        }

        for( var i =0; i< data.length; i++) {
            var h = new Horario({
                id_asignatura: respuesta._id,
                grupo: respuesta.grupo,
                dia: data[i].dia,
                h_inicio: data[i].hora_inicio,
                h_fin: data[i].hora_fin,
                fecha: data[i].fecha,
                registro: false
            });
            h.save();
        }


    };
    request.open(method, url, async);

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    request.send(postData);
}

function asignacion(resultado) {
   if(!resultado){
       return 'no hay resultado'
   }else {
       return 'si hay resultado'
   }
}

module.exports = router;
