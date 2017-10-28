var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    id_asignatura: {type: Schema.Types.ObjectId, ref: 'Registro',required: true},
    grupo:{type: String, require: true},
    id_horario: {type: Schema.Types.ObjectId, ref: 'Horario'},
    dia_registro: {type: String, required: true},
    fecha_registro: {type: String, required: true},
    hora_registro: {type: String, required: true},
    observaciones: {type: String, required: true},
    otros_temas: {type: String, required: true},
    año:{type: String, required: true},
    periodo: {type: String, required: true}

});

module.exports = mongoose.model('Registro', schema);