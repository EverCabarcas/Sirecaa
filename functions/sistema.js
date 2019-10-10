var jwt = require('jsonwebtoken');
var curso = require('../models/curso');
var proyecto_docente = require('../models/proyecto_docente');
var registro = require('../models/registros');
var horario = require('../models/horario');
var temas_vistos = require('../models/tema_visto');
var temas = require('../models/tema');
var asistencia = require('../models/asistencia');
var Promise = require('promise');
var transactionsModel = require('../models/transactions');
var mongoose = require('mongoose');

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

exports.annomenor = function (req, res, next) {

    if(req.body.modulo === 'PROYECTO_DOCENTE'){

        proyecto_docente.find({id_programa: req.body.id_programa}).sort({anno: 1}).limit(1).exec(function (err, prodoc) {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error en la búsqueda de los proyectos docente para encontrar el menor año: '+err
                });
            }

            if(prodoc.length){
                return res.status(200).json({
                    mensaje: prodoc[0].anno
                });
            } else {
                return res.status(500).json({
                    mensaje: 0
                });
            }
        });

    } else {

        if(req.body.modulo === 'REGISTRO'){

            registro.find({}).sort({anno: 1}).limit(1).exec(function (err, reg) {
                if (err) {
                    return res.status(500).json({
                        mensaje: 'Error en la búsqueda de los registros para encontrar el menor año: '+err
                    });
                }

                if(reg.length){
                    return res.status(200).json({
                        mensaje: reg[0].anno
                    });
                } else {
                    return res.status(500).json({
                        mensaje: 0
                    });
                }
            });

        } else {

            if(req.body.modulo === 'CURSO'){

                curso.find({id_programa: req.body.id_programa}).sort({anno: 1}).limit(1).exec(function (err, cur) {
                    if (err) {
                        return res.status(500).json({
                            mensaje: 'Error en la búsqueda de los cursos para encontrar el menor año: '+err
                        });
                    }

                    if(cur.length){
                        return res.status(200).json({
                            mensaje: cur[0].anno
                        });
                    } else {
                        return res.status(500).json({
                            mensaje: 0
                        });
                    }
                });

            } else {

                return res.status(500).json({
                    mensaje: 'Identificador no válido para la búsqueda del menor año.'
                });

            }
        }
    }
};

exports.nombreasignaturas = function (req, res, next) {
    curso.find({id_programa: req.body.id_programa, anno: req.body.anno , periodo: req.body.periodo},function (err, cursos) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar los nombres de las asignaturas: '+err
            });
        }

        if(!cursos.length){
            return res.status(500).json({
                mensaje: 'No se han sincronizado los cursos para el programa en el periodo académico seleccionado.'
            });
        }

        let unique_array = cursos.filter(function(elem, index, self) {
            return index === self.map(function(s) { return s.nombre; }).indexOf(elem.nombre);
        });

        var array = [];

        //Buscamos si la asignatura ya tiene un proyecto docente
        var proyectos_function = function findProyectos(curso){
            return new Promise((resolve, reject) => {
                proyecto_docente.findOne({nombre:curso.nombre, anno: curso.anno, periodo: curso.periodo}, function (err, prdocente) {
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
};

exports.obtenerregistros = function (req, res, next) {
  var response = [];
  registro.find({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo, anno: req.body.anno, periodo: req.body.periodo}, function (err, registros) {
      if (err) {
          return res.status(500).json({
              mensaje: 'Error al buscar los registros académicos: '+err
          });
      }

      if (!registros.length) {
          return res.status(500).json({
              mensaje: 'El curso no tiene registros académicos.'
          });
      }

      var horarios_function = function findHorarios(registro){
          return new Promise((resolve, reject) => {
              horario.findOne({_id: registro.id_horario}, function (err, horario) {
                  if (err) {
                      return res.status(500).json({
                          mensaje: 'Error al buscar el horario del registro: '+err
                      });
                  }

                  if(horario != null) {
                      resolve(response.push({registro: registro, horario: horario}))
                  }
              });
          });
      };

      var actions = registros.map(horarios_function);
      var results = Promise.all(actions);

      results.then(
          data => {
              response.sort(function(a, b){
                  return a.horario.fecha.toLowerCase().localeCompare(b.horario.fecha.toLowerCase());
              });
              return res.status(200).json({
                  mensaje: response
              })
          }
      );

  });
};

exports.obtenerhorario = function (req, res, next) {

     horario.findOne({_id: req.body.id_horario}, function (err, horario) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar el horario del registro: '+err
            });
        }

        if(horario != null) {
            return res.status(200).json({
                mensaje: horario
            });
        }else{
            return res.status(500).json({
                mensaje: 'No existen horarios asociados al registro'+err
            });
        }
    });
};

exports.obtenertemasvistos = function (req, res, next) {
    let temasr = [];
    temas_vistos.find({id_registro: req.body.id_registro }, function (err, temas_vistos) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar los temas vistos de un registro: '+err
            });
        }

        if (!temas_vistos.length) {
            return res.status(200).json({
                mensaje: []
            });
        }

        var temas_function = function findTemas(tema_visto){
            return new Promise((resolve, reject) => {
                temas.findOne({_id: tema_visto.id_tema}, function (err, tema) {
                    if (err) {
                        return res.status(500).json({
                            mensaje: 'Error al buscar los temas de un registro: '+err
                        });
                    }
                    if(tema != null){
                        resolve(temasr.push(tema));
                    }
                });
            })
        };

        var actions = temas_vistos.map(temas_function);
        var results = Promise.all(actions);

        results.then(
            data => {
                return res.status(200).json({
                    mensaje: temasr
                });
            }
        );

    });
};

exports.obtenerasistencia = function (req, res, next) {
    asistencia.find({id_registro: req.body.id_registro}, function (err, asistencias) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar la lista de asistencia del registro: '+err
            });
        }
        if(asistencias != null){
            return res.status(200).json({
                mensaje: asistencias
            });
        }else{
            return res.status(500).json({
                mensaje: 'No existe listado de asistencia asociado al registro'
            });
        }
    });
};

exports.createtransactions = (req, res, next) =>{
    var transaction = new transactionsModel(req.body);
    transaction.save((err, result)=>{
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido: '+err
            });
        }
        return res.status(200).json({
            mensaje: 'Transaccion almacenada con exito'
        });
    })
};

exports.obtenertransactions = ({query}, res, next) =>{
    let fecha_inicio = new Date()
    let fecha_fin = new Date()
    let objeto = {};

    if (query.fecha_inicio && query.fecha_fin ) {
        fecha_inicio = new Date(query.fecha_inicio);
        fecha_fin = new Date(query.fecha_fin);
        objeto["fecha"] = {"$gte": fecha_inicio, "$lt": fecha_fin}
    }

    if (query.nombre ) {
        objeto["user.nombre"] = {"$regex": query.nombre, "$options": 'i' };
    }

    if (query.perfil ) {
        objeto["user.perfil"] = {"$regex": query.perfil, "$options": 'i'  };
    }

    if (query.accion ) {
        objeto["accion"] = {"$regex": query.accion, "$options": 'i'  };
    }

    if(!query.anno || ! query.periodo){
        return res.status(400).json({mensaje:'Año y periodo deben ser suministrados'})
    }

    if(!query.programa){
        return res.status(400).json({mensaje:'El programa académico debe ser suministrado'})
    }

    objeto["extra_data.anno"] = query.anno;
    objeto["extra_data.periodo"] = query.periodo;
    objeto["user.programa"] = query.programa;


    transactionsModel.aggregate([
        { "$match": objeto}
    ])
        .then(r=>{
            return res.status(200).json({mensaje:r})
        })
    /*if (query.anno){
        if (query.periodo){
            if (query.fecha_inicio && query.fecha_fin ){
                let fecha_inicio = new Date(fecha_inicio);
                let fecha_fin = new Date(fecha_fin);

                transactionsModel.find({'extra_data.anno':query.anno, 'extra_data.perido':query.periodo, fecha: {$gte: fecha_inicio, $lte: fecha_fin}})
                    .then(respuesta=>{
                        return res.status(200).json({mensaje:respuesta})
                    })

            }else{
                transactionsModel.find({'extra_data.anno':query.anno, 'extra_data.perido':query.periodo})
                    .then(respuesta=>{
                        return res.status(200).json({mensaje:respuesta})
                    })
            }
        }
    }
    else{
        //return res.status(400).json({mensaje:'Año y periodo deben ser suministrados'})
        transactionsModel.aggregate([
            { "$match": { "extra_data.anno": "2019" } }
        ])
            .then(r=>{
                return res.status(200).json({mensaje:r})
            })
    }*/


};
