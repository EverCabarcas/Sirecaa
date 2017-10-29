var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    id_asignatura: {type: Schema.Types.ObjectId, ref: 'Curso', required: true},
    grupo: {type: String, required: true},
    dia: {type: String, required: true},
    h_inicio: {type: String, required: true},
    h_fin: {type: String, required: true},
    fecha: {type: String, required: true},
    registro: {type: Boolean, required: true}
});

module.exports = mongoose.model('Horario', schema);