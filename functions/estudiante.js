var jwt = require('jsonwebtoken');
var comentarioModel = require('../models/comentario');

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

exports.crearcomentario = function (req, res, next) {
  var comentario = new comentarioModel({
      id_registro: req.body.id_registro,
      id_estudiante: req.body.id_estudiante,
      nombre_estudiante: req.body.nombre_estudiante,
      comentario: req.body.comentario,
      calificacion: req.body.calificacion,
      visto: false,
      fecha: new Date()
  });

  comentario.save(function (err, comentario) {
      if(err){
          return res.status(400).json({
              mensaje: 'Error al guardar el comentario: '+ err
          });
      }else{
          return res.status(200).json({
              mensaje: comentario
          });
      }
  });
};

exports.obtenercomentarios = function (req, res, next) {
    comentarioModel.find({id_registro: req.body.id_registro, id_estudiante: req.body.id_estudiante}, function (err, comentarios) {
        if(err){
            return res.status(500).json({
                mensaje: 'Error en la búsqueda de los comentarios: '+ err
            });
        }
        if(comentarios.length == 0){
            return res.status(500).json({
                mensaje: 'No hay comentarios sobre este registro académico.'
            });
        }else{
            var date_sort_desc = function (comentario1, comentario2) {
                if (comentario1.fecha > comentario2.fecha) return -1;
                if (comentario1.fecha < comentario2.fecha) return 1;
                return 0;
            };

            comentarios.sort(date_sort_desc);
            return res.status(200).json({
                mensaje: comentarios
            });
        }
    });
};

exports.editarcomentario = function (req, res, next) {
  comentarioModel.findById({_id: req.body.id_comentario}, function (err, comentario) {
      if(err){
          return res.status(500).json({
              mensaje: 'Error en la búsqueda del comentario que se quiere editar: '+ err
          });
      }
      if(comentario == null){
          return res.status(500).json({
              mensaje: 'No se encontró almacenado el comentario a editar.'
          });
      } else {
          comentario.comentario = req.body.comentario;
          comentario.calificacion = req.body.calificacion;
          comentario.save();
          return res.status(200).json({
              mensaje: 'Comentario editado con éxito.'
          });
      }
  })
};

exports.eliminarcomentario = function (req, res, next) {
  comentarioModel.findOneAndRemove({_id: req.body.id_comentario}, function (err, comentario) {
      if(err){
          return res.status(500).json({
              mensaje: 'Error en la eliminación del comentario: '+ err
          });
      }else{
          return res.status(200).json({
              mensaje: 'Comentario eliminado con éxito.'
          });
      }
  });
};
