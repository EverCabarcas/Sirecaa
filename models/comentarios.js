var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    id_registro: {type: Schema.Types.ObjectId, ref:'Registro'},
    id_estudiante: {type: String, required: true},
    comentario : {type: String, required: true},
    marcado : {type: Boolean, required: true},
    valoracion : {type: String, required: true}
});

module.exports = mongoose.model('Comentario', schema);