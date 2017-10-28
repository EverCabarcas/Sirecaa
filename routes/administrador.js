var express = require('express');
var router = express.Router();
var curso = require('../models/curso');
var area = require('../models/area');
var proyecto_docente = require('../models/proyecto_docente');
var Tema = require('../models/tema');
var Curso2 =  require('../models/curso');
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
router.post('/asignaturasprograma', function (req, res, err) {
    var url = "http://190.242.62.234:8080/SIRECAARST/programacion/xprograma";
    var method = "POST";
    var postData = 'id_programa='+req.body.id_programa+'&anno='+req.body.anno+'&periodo='+req.body.periodo+'&token='+req.body.token_udc;

// You REALLY want async = true.
// Otherwise, it'll block ALL execution waiting for server response.
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
        var c = new curso({
            id_asignatura : data[0].id_asignatura,
            grupo : data[0].grupo,
            nombre: data[0].nombre_asignatura,
            id_proyecto: '',
            id_area: ''
        });
        c.save();
        res.status(200).json({
           message: data[0]
        });


    };
    request.open(method, url, async);

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    request.send(postData);


    /*for(var i in data) {
        curso.find({
            id_asignatura: data[i].id_asignatura,
            grupo: data[i].grupo
        }, function (err, resultado) {
            if (err) {
                return res.status(500).json({
                    message: 'error en la comparacion de asignaturas de nuestra bd con la de udc' + err
                });
            }
            if (!resultado) {
                var c = new Curso2({
                    id_asignatura: data[i].id_asignatura,
                    grupo: data[i].grupo,
                    nombre: data[i].nombre_asignatura,
                    id_proyecto: '',
                    id_area: ''
                });
                c.save();
            }
        });
    }

    Curso2.find(function (err, resultado) {
        if(err){
            return res.status(400).json({
                message : 'Error en la operacion de cursos '+err
            });
        }
        res.status(200).json({
            mensaje : resultado
        });
    });*/

});

function horario(re,req) {

    var url = "http://190.242.62.234:8080/SIRECAARST/programacion/horario";
    var method = "POST";
    var postData = 'id_asignatura='+re.id_asignatura+'&grupo='+re.grupo+'&anno='+req.body.anno+'&periodo='+req.body.periodo+'&token='+req.body.token_udc;

// You REALLY want async = true.
// Otherwise, it'll block ALL execution waiting for server response.
    var async = true;

    var request = new XMLHttpRequest();

// Before we send anything, we first have to say what we will do when the
// server responds. This seems backwards (say how we'll respond before we send
// the request? huh?), but that's how Javascript works.
// This function attached to the XMLHttpRequest "onload" property specifies how
// the HTTP response will be handled.
    request.onload = function () {

        // Because of javascript's fabulous closure concept, the XMLHttpRequest "request"
        // object declared above is available in this function even though this function
        // executes long after the request is sent and long after this function is
        // instantiated. This fact is CRUCIAL to the workings of XHR in ordinary
        // applications.

        // You can get all kinds of information about the HTTP response.
        var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
        var data2 = JSON.parse(this.responseText); // Returned data, e.g., an HTML document.
        var horario1 = require('../models/horario');
        for (var j in data2) {
            var h = new horario1({
                id_asignatura: re._id,
                grupo: re.grupo,
                dia: data2[j].dia,
                h_inicio: data2[j].hora_inicio,
                h_fin: data2[j].hora_fin,
                fecha: data2[j].fecha,
                registro: false
            });
            h.save();
        }
        /*
        if(status != 200){
            return res.status(status).json({
                message: 'Error de Autenticación, al buscar los horarios: '+ status
            });
        }
        */
    };

    request.open(method, url, async);

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
// Or... request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
// Or... whatever

// Actually sends the request to the server.
    request.send(postData);
}

module.exports = router;
