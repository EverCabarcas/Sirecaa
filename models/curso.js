var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    id_programa: {type: String},
    id_asignatura: {type: String},
    grupo: {type: String},
    nombre: {type: String},
    id_proyecto: {type: String},
    id_area: {type: String},
    periodo: {type: String},
    anno: {type: String},
    id_docente: {type: String},
    tipo_asignatura: {type: String},
    correo_docente: {type: String},
    nombre_docente: {type: String},
    reforma_pensum: {type: String}
});

module.exports = mongoose.model('Curso', schema);