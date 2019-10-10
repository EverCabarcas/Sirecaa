var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
       id_proyecto: { type: Schema.Types.ObjectId, ref: 'Proyecto_Docente', required: true},
       nombre: {type: String, required: true},
       visto: {type: Boolean, required: true}
});

module.exports = mongoose.model('Tema', schema);