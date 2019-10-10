var mongoose = require('mongoose');
var Schema = mongoose.Schema;

schema = new Schema({
    id_registro: {type: Schema.Types.ObjectId, ref: 'Registro', required: true},
    id_estudiante: {type: String, required: true},
    nombre_estudiante: {type: String, required: true},
    comentario: {type: String, required: true},
    calificacion: {type: Number, required: true},
    visto: {type: Boolean, required: true},
    fecha: {type: Date, required: true}
});

module.exports = mongoose.model('Comentario', schema);
