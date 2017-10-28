var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
   id_registro: {type: Schema.Types.ObjectId, ref: 'Registro', required: true},
   id_estudiante: {type: String, required: true},
   inasistencia: {type: Boolean, required: true}
});

module.exports = mongoose.model('Asistencia', schema);
