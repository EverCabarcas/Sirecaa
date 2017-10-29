var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    id_asignatura: {type: String, required: true},
    grupo: {type: String, required: true},
    nombre: {type: String, required: true},
    id_proyecto: {type: String, required: true},
    id_area: {type: String, required: true}
});

module.exports = mongoose.model('Curso', schema);