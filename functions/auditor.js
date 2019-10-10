var jwt = require('jsonwebtoken');
var comentarioModel = require('../models/comentario');
var areaModel = require('../models/area');
var cursoModel = require('../models/curso');
var prDocente = require('../models/proyecto_docente');
var temaModel = require('../models/tema');
var temaVistoModel = require('../models/tema_visto');
var registroModel = require('../models/registros');
var asistenciaModel = require('../models/asistencia');
var horarioModel = require('../models/horario');

exports.autenticacion = function (req, res, next){
    jwt.verify(req.query.token_sirecaa, 'sirecaa_secret', function (err, decoded) {
        if (err) {
            return res.status(401).json({
                mensaje: 'Tiempo de sesion finalizado',
                error: err
            });
        }
        next();
    })
};

exports.obtenercomentarios = function (req, res, next) {
    comentarioModel.find({id_registro: req.body.id_registro}, function (err, comentarios) {
        if(err){
            return res.status(400).json({
                mensaje: 'Error al búscar los comentarios de este registro '+ err
            });
        }
        if(!comentarios){
            return res.status(200).json({
                mensaje: 'No hay comentarios realizados sobre este registro'
            });
        }else{
            return res.status(200).json({
                mensaje: comentarios
            });
        }
    });
};

exports.marcarcomentario = function (req, res, next) {
  comentarioModel.findById(req.body.id_comentario, function (err, comentario) {
      if(err){
          return res.status(400).json({
              mensaje: 'Error al búscar el comentario '+ err
          });
      }else{
          if(comentario.visto != req.body.visto){
            if(req.body.visto){
                comentario.visto = req.body.visto;
                return res.status(200).json({
                    mensaje: 'Comentario marcado como visto'
                });
            }else{
                comentario.visto = req.body.visto;
                return res.status(200).json({
                    mensaje: 'Comentario marcado como no visto'
                });
            }
          }else{
              return res.status(200).json({
                  mensaje: 'No existe cambio de marcado en el comentario que intenta marcar'
              });
          }
      }
  })
};

exports.obtenercursos = function (req, res, next) {
    areaModel.findOne({id_docente:req.body.id_docente}, function (err, area) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar el area al que lidera el docente '+err
            });
        }
        if(!area){
            return res.status(500).json({
                mensaje: 'El docente no es un auditor'
            });
        }

        cursoModel.find({id_area: area._id, anno: req.body.anno, periodo: req.body.periodo}, function (err, cursos) {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al buscar los cursos del area '+err
                });
            }

            return res.status(200).json({
                mensaje: cursos
            });
        });

    });
};

exports.avancetemasporcurso = async function (req, res, next) {
    let cursoResponse;
    try {
        cursoResponse = await cursoModel.findOne({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo, anno: req.body.anno, periodo: req.body.periodo });
    }catch (err) {
        return res.status(500).json({
            mensaje: 'Error al buscar el curso '+err
        });
    }

    let registrosResponse;
    try {
        registrosResponse = await registroModel.find({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo, anno: req.body.anno, periodo: req.body.periodo });
    }catch (err) {
        return res.status(500).json({
            mensaje: 'Error al buscar los registros del curso '+err
        });
    }


    let temaResponse;
    try {
        temaResponse = await temaModel.find({id_proyecto: cursoResponse.id_proyecto});
    }catch (err) {
        return res.status(500).json({
            mensaje: 'Error al buscar los temas vistos '+err
        });
    }

    var temafilter = [];
    for (var j = 0; j < registrosResponse.length; j++ ){
        for (var i = 0; i < temaResponse.length; i++) {
            let temavistoResponse;
            try {
                temavistoResponse = await temaVistoModel.findOne({ id_tema: temaResponse[i]._id, id_registro: registrosResponse[j]._id });
            }catch (err) {
                return res.status(500).json({
                    mensaje: 'Error al buscar los temas en la colección de temas vistos '+err
                });
            }
            if (temavistoResponse != null) temafilter.push(temavistoResponse);
        }
    }

    function removeDuplicates(originalArray, prop) {
        var newArray = [];
        var lookupObject  = {};

        for(var i in originalArray) {
            lookupObject[originalArray[i][prop]] = originalArray[i];
        }

        for(i in lookupObject) {
            newArray.push(lookupObject[i]);
        }
        return newArray;
    }

    var uniqueArray = removeDuplicates(temafilter, "id_tema");


    return res.status(200).json({
        mensaje: {
            vistos: uniqueArray.length,
            no_vistos: temaResponse.length - uniqueArray.length
        }
    });

};

exports.asistenciaporcurso = async function (req, res, next) {

    let horarioResponse;
    try {
        horarioResponse = await horarioModel.find({id_asignatura: req.body.id_asignatura, anno: req.body.anno, periodo: req.body.periodo, grupo: req.body.grupo});
    }catch (err) {
        return res.status(500).json({
            mensaje: 'Error al momento de contar las clases de un curso '+err
        });
    }

    let registroResponse;
    try {
        registroResponse = await registroModel.find({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo, anno: req.body.anno, periodo: req.body.periodo});
    }catch (err) {
        return res.status(500).json({
            mensaje: 'Error al buscar los registros del curso '+err
        });
    }
    if (!registroResponse) {
        return res.status(200).json({
            mensaje: 'El curso no tiene registros diligenciados'
        });
    }

    var numasistencia = 0;
    var numno_asistencia = 0;

    for (var i = 0; i < registroResponse.length; i++) {
        let asistenciaResponse = {};
        try {
            asistenciaResponse = await asistenciaModel.findOne({id_registro: registroResponse[i]._id, id_estudiante: req.body.id_estudiante});
        }catch (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar las asistencias de un estudiante '+err
            });
        }
        if (asistenciaResponse){
            if (asistenciaResponse.inasistencia) {
                numno_asistencia += 1;
            }else {
                numasistencia += 1;
            }
        }

    }
    return res.status(200).json({
        mensaje: {
            asistencias: numasistencia,
            no_asisencias: numno_asistencia,
            horarios: horarioResponse.length
        }
    });
};

exports.registrosdiligenciados = async function (req, res, next) {
    let horarioResponse;
    try {
        horarioResponse = await horarioModel.find({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo, anno: req.body.anno, periodo: req.body.periodo});
    }catch (err) {
        return res.status(500).json({
            mensaje: 'Error al buscar los horarios de los registros '+err
        });
    }

    let diligenciados = [];
    let no_diligenciados = 0;
    let diligenciados_fuera = [];

    for (var i = 0; i < horarioResponse.length; i++) {
        let registroResponse;
        if (horarioResponse[i].registro) {
            try {
                registroResponse = await registroModel.findOne({id_horario: horarioResponse[i]._id });
            }catch (err) {
                return res.status(500).json({
                    mensaje: 'Error al buscar los horarios de los registros '+err
                });
            }
            diligenciados.push(registroResponse);
            if((registroResponse.fecha_registro > horarioResponse[i].fecha) || (registroResponse.fecha_registro === horarioResponse[i].fecha && registroResponse.hora_registro > horarioResponse[i].h_fin )){
             diligenciados_fuera.push(registroResponse);
            }
        }else{
            no_diligenciados += 1;
        }
    }

    return res.status(200).json({
        mensaje: {
            diligenciados: diligenciados,
            no_diligenciados: no_diligenciados,
            diligenciados_fuera: diligenciados_fuera,
            horarios: horarioResponse
        }
    });

};

exports.nombreasignaturas = function ({query, body}, res, next) {

    if(!body.id_programa || !body.anno || !body.periodo || !body.id_docente ) return res.status(400).json({mensaje:"Estos campos son requeridos: 'id_programa', 'anno', 'periodo' y 'id_docente' "});

    areaModel.findOne({id_docente: body.id_docente}, function (err, area) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar el area al que lidera el docente '+err
            });
        }
        if(!area){
            return res.status(500).json({
                mensaje: 'El docente no es un auditor'
            });
        }

        cursoModel.find({id_area: area._id, anno: body.anno, periodo: body.periodo, id_programa: body.id_programa}, function (err, cursos) {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al buscar los cursos del area '+err
                });
            }

            let unique_array = cursos.filter(function(elem, index, self) {
                return index === self.map(function(s) { return s.nombre; }).indexOf(elem.nombre);
            });

            var array = [];

            //Buscamos si la asignatura ya tiene un proyecto docente
            var proyectos_function = function findProyectos(curso){
                return new Promise((resolve, reject) => {
                    prDocente.findOne({nombre:curso.nombre, anno: curso.anno, periodo: curso.periodo}, function (err, prdocente) {
                        if (err) {
                            return res.status(500).json({
                                mensaje: 'Error al buscar proyecto docente a partir de una asignatura: '+err
                            });
                        }

                        if(prdocente){
                            resolve();
                        }else{
                            resolve(array.push({id_asignatura: curso.id_asignatura, nombre: curso.nombre}));
                        }
                    });
                });
            };

            var actions = unique_array.map(proyectos_function);
            var results = Promise.all(actions);

            results.then(
                data => {
                    array.sort(function(a, b){
                        return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
                    });
                    return res.status(200).json({
                        mensaje: array
                    });
                }
            );

        });

    });
};

exports.proyectosdocente = ({query, body}, res, next) =>{

    if(!body.id_programa || !body.anno || !body.periodo || !body.id_docente ) return res.status(400).json({mensaje:"Estos campos son requeridos: 'id_programa', 'anno', 'periodo' y 'id_docente' "});

    areaModel.findOne({id_docente: body.id_docente}, function (err, area) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar el area al que lidera el docente '+err
            });
        }
        if(!area){
            return res.status(500).json({
                mensaje: 'El docente no es un auditor'
            });
        }

        cursoModel.find({id_area: area._id, anno: body.anno, periodo: body.periodo, id_programa: body.id_programa}, function (err, cursos) {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al buscar los cursos del area '+err
                });
            }

            let unique_array = cursos.filter(function(elem, index, self) {
                return index === self.map(function(s) { return s.nombre; }).indexOf(elem.nombre);
            });

            var array = [];

            //Buscamos si la asignatura ya tiene un proyecto docente
            var proyectos_function = function findProyectos(curso){
                return new Promise((resolve, reject) => {
                    prDocente.findOne({nombre:curso.nombre, anno: curso.anno, periodo: curso.periodo}, function (err, prdocente) {
                        if (err) {
                            return res.status(500).json({
                                mensaje: 'Error al buscar proyecto docente a partir de una asignatura: '+err
                            });
                        }

                        if(prdocente){
                            resolve(prdocente);
                        }else{
                            resolve()
                        }
                    });
                });
            };

            var actions = unique_array.map(proyectos_function);
            var results = Promise.all(actions);

            results.then(
                data => {
                    let noNullData = data.filter(Boolean);
                    return res.status(200).json({
                        mensaje: noNullData
                    });
                }
            );

        });

    });
};
