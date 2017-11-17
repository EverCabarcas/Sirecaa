var express = require('express');
var router = express.Router();
var curso = require('../models/curso');
var area = require('../models/area');
var proyecto_docente = require('../models/proyecto_docente');
var Horario = require('../models/horario');
var Tema = require('../models/tema');
var CP = require('../models/comprueba_periodo');
var date = new Date();
var jwt = require('jsonwebtoken');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var bol = false;


router.use('/', function (req, res, next) {
    jwt.verify(req.query.token_sirecaa, 'sirecaa_secret', function (err, decoded) {
        if (err) {
            return res.status(401).json({
                mensaje: 'No Autenticado '+err
            });
        }
        next();
    })
});
router.post('/asignaturainfo', function (req, res, next) {
    curso.findOne({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo}, function (err, c) {
        if(!c){
            return res.status(500).json({
                mensaje: 'Curso no encontrado'
            });
        }
        if(err){
            return res.status(400).json({
                mensaje: 'Error en la operacion '+err
            });
        }
        res.status(200).json({
            mensaje: c
        });
    });
});

router.post('/areainfo', function (req, res, next) {
   curso.findOne({id_asignatura: req.body.id_asignatura, anno:req.body.anno, periodo: req.body.periodo},function (err, curso) {
       if(err){
           return res.status(400).json({
               mensaje: 'Error en la operacion de busqueda de area de un curso'+err
           });
       }
       if(!curso){
           return res.status(500).json({
               mensaje: 'Curso no encontrado'
           });
       }
       if(curso.id_area == 'vacio'){
           return res.status(500).json({
               mensaje: 'Curso no tiene area asociada'
           });
       }
       area.findById(curso.id_area, function (err, area) {
           if(!area){
               return res.status(500).json({
                   mensaje: 'Area no encontrada'
               });
           }
           if(err){
               return res.status(400).json({
                   mensaje: 'Error en la operacion '+err
               });
           }
           res.status(200).json({
               nombre : area.nombre,
               id_docente : area.id_docente,
               nombre_docente: area.nombre_docente,
               _id: area._id
           });
       });
   });


});

router.post('/proyectodocenteinfo', function (req, res, next) {
    curso.findOne({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo, anno: req.body.anno, periodo: req.body.periodo }, function (err, curso) {
        if(!curso){
            return res.status(500).json({
                mensaje: 'Curso no encontrado'
            });
        }
        if(err){
            return res.status(400).json({
                mensaje: 'Error en la operacion '+err
            });
        }
        if(curso.id_proyecto == 'vacio'){
            return res.status(500).json({
                mensaje: 'No hay proyecto docente asociado al curso'
            });
        }else {
            proyecto_docente.findById(curso.id_proyecto, function (err, proyecto) {
                if(err){
                    return res.status(400).json({
                        mensaje: 'Error en la operacion '+err
                    });
                }
                Tema.find({id_proyecto: curso.id_proyecto}, function (err, temas) {
                    if (!temas) {
                        return res.status(500).json({
                            mensaje: 'El Proyecto Docente no tiene temas asociados'
                        });
                    }
                    if (err) {
                        return res.status(400).json({
                            mensaje: 'Error en la operacion ' + err
                        });
                    }
                    res.status(200).json({
                        _id: proyecto._id,
                        objetivos: proyecto.objetivos,
                        competencias: proyecto.competencias,
                        bibliografia: proyecto.bibliografia,
                        anno: proyecto.anno,
                        periodo: proyecto.periodo,
                        temas: temas
                    });
                });
            });

        }
    })
});

router.post('/proyectodocente', function (req, res, next) {
    var fecha2 = date.getTime() + (184*24*60*60*1000);
    var fecha6 = new Date(fecha2);
    // Milisegundos de 3 días mas suma3dias= 30*24*60*60*1000; (días * 24 horas * 60 minutos * 60 segundos * 1000 milésimas de segundo)

    var proyecto = new proyecto_docente({
        id_programa: req.body.id_programa,
        objetivos: req.body.objetivos,
        competencias: req.body.competencias,
        bibliografia: req.body.bibliografia,
        anno: req.body.anno,
        periodo: req.body.periodo,
        fecha_inicio: date, // milisegundos ''+(date.getDay())+'/'+(date.getMonth()+1)+'/'+date.getFullYear()
        fecha_fin:    fecha6               //''+(date.getDay())+'/'+((date.getMonth()+1)+6)+'/'+date.getFullYear()
    });
    proyecto.save(function (err, result) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error a ocurrido '+err
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
            mensaje: 'Proyecto Docente Creado'
        });

    });
});

router.post('/iniciarperiodoacademico', function (req, res, next) {
    CP.findOne({id_programa: req.body.id_programa, anno: req.body.anno, periodo: req.body.periodo }, function (err, resultado) {
        if(err){
            return res.status(500).json({
                mensaje: 'Error en la busqueda de un comprueba-periodo '+err
            });
        }
        if(!resultado){
            var cp = new CP({
                id_programa: req.body.id_programa,
                anno: req.body.anno,
                periodo: req.body.periodo,
                estado: true
            });
            cp.save();
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
                        mensaje: 'Error de peticion: ' + status
                    });
                }
                for (var i = 0; i < data.length; i++) {
                    var c = new curso({
                        id_programa: req.body.id_programa,
                        id_asignatura: data[i].id_asignatura,
                        grupo: data[i].grupo,
                        nombre: data[i].nombre_asignatura,
                        id_proyecto: 'vacio',
                        id_area: 'vacio',
                        periodo : req.body.periodo,
                        anno : req.body.anno
                    });
                    c.save(function (err, respuesta) {
                        if (err) {
                            return res.status(500).json({
                                mensaje: 'error al guardar los horarios' + err
                            });
                        }
                        horario(respuesta, req, res);
                    });
                }
                return res.status(200).json({
                    mensaje: 'Periodo academico iniciado con exito : Falta el nombre de la asignatura'
                });
            };
            request.open(method, url, async);

            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            request.send(postData);

        }else{
            return res.status(200).json({
                mensaje: 'El periodo academico ya ha sido iniciado para este programa'
            });
        }

    });

});

router.post('/estadodelperiodo',function (req, res, next) {
    CP.findOne({id_programa: req.body.id_programa, anno: req.body.anno, periodo: req.body.periodo }, function (err, resultado) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error en la busqueda de un comprueba-periodo '+err
            });
        }
        if(resultado){
            return res.status(200).json({
                mensaje: resultado.estado
            });
        }
        if(!resultado){
            return res.status(500).json({
                mensaje: false
            });
        }
    });
});

router.post('/modificaciondelperiodo',function (req, res, next) {
    CP.findOne({id_programa: req.body.id_programa, anno: req.body.anno, periodo: req.body.periodo }, function (err, resultado) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al modificar '+err
            });
        }
        if(resultado){
            resultado.estado = req.body.estado;
            resultado.save();
            return res.status(200).json({
                mensaje: 'Exito al modificar el periodo'
            });
        }else{
            return res.status(500).json({
                mensaje: 'no se ha creado el periodo ingresado'
            });
        }
    });
});

router.post('/listaproyectosdocente', function (req, res, next) {
        proyecto_docente.find({id_programa: req.body.id_programa}, function (err, proyectos) {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al listar los proyectos '+err
                });
            }
            if(!proyectos.length){
                return res.status(500).json({
                    mensaje: 'No hay proyectos docentes asociados a este programa'
                });
            }
            return res.status(200).json({
                mensaje: proyectos
            });
        });
});

router.post('/asignarproyectodocente', function (req, res, next) {
        curso.findOne({id_asignatura: req.body.id_asignatura , grupo: req.body.grupo, periodo: req.body.periodo, anno: req.body.anno }, function (err, curso) {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error en la asignacion de proyecto docente '+err
                });
            }
            if(!curso){
                return res.status(500).json({
                    mensaje: 'El curso que intenta buscar no existe'+err
                });
            }
            curso.id_proyecto = req.body.id_proyecto;
            curso.save();
            return res.status(200).json({
                mensaje: 'Proyecto docente asignado con exito'
            });
        });
});

router.post('/cursosdeunproyecto', function (req, res, next) {
        curso.find({id_proyecto: req.body.id_proyecto}, function (err, cursos) {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al buscar los cursos de un proyecto docente '+err
                });
            }
            if(!cursos.length){
                return res.status(500).json({
                    mensaje: 'No hay cursos asociados a este proyecto docente'
                });
            }
            return res.status(200).json({
                mensaje: cursos
            });
        });
});

router.post('/temasdeunproyecto', function (req, res ,next) {
    Tema.find({id_proyecto: req.body.id_proyecto}, function (err, temas) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar los temas de un proyecto docente '+err
            });
        }

        if(!temas.length){
            return res.status(500).json({
                mensaje: 'No hay temas asociados a este proyecto docente'
            });
        }

        return res.status(200).json({
            mensaje: temas
        });
    });
});

router.post('/creararea', function (req, res, next) {
    var Area = new area({
        nombre: req.body.nombre,
        id_programa: req.body.id_programa,
        id_docente: req.body.id_docente,
        nombre_docente: req.body.nombre_docente
    });
    Area.save(function (err, result) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error a ocurrido al crear el Area '+err
            });
        }
        res.status(201).json({
            mensaje: 'Area creada con exito'
        });
    });
});

router.post('/docentesdeunprograma', function (req, res, next) {
    var url = "http://190.242.62.234:8080/SIRECAARST/programacion/xprograma";
    var method = "POST";
    var postData = 'id_programa='+req.body.id_programa+'&anno='+req.body.anno+'&periodo='+req.body.periodo+'&token='+req.body.token_udc;

    var async = true;

    var request = new XMLHttpRequest();

    request.onload = function () {

        var status = request.status;
        var data = JSON.parse(this.responseText);
        if(status != 200){
            return res.status(status).json({
                mensaje: 'Error de Autenticación: '+ status
            });
        }

        /*var docentes_programa = {
            id: String,
            nombre: String
        };*/
        var array = [];
        var aux = [];
        for(var i =0; i< data.length; i++){
            array.push({id: data[i].id_docente, nombre: data[i].nombre_docente});
        }
        var cont=0;
        for(var j = 0; j< array.length; j++){
            for(var k = 0 ; k < array.length; k++){
                if(array[j] == array[k]){
                    cont++;
                }
            }
            if(cont>2){
                aux.push({id: array[j].id, nombre: array[j].nombre});
            }
            cont=0;
        }

        return res.status(200).json({
            mensaje: array,
            mensaje2: aux
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
                mensaje: 'Error de peticion: ' + status
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
                registro: false,
                periodo: req.body.periodo,
                anno: req.body.anno
            });
            h.save();
        }


    };
    request.open(method, url, async);

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    request.send(postData);
}

module.exports = router;
