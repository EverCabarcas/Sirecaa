var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
   id_registro: {type: Schema.Types.ObjectId, ref: 'Registro', required: true},
   id_tema: {type: Schema.Types.ObjectId, ref: 'Tema', required: true}
});

module.exports = mongoose.model('Tema_Visto', schema);