var mongoose = require('mongoose');
var Schema = mongoose.Schema;

schema = new Schema({
   id_programa:{type: String, require: true},
   id_docente:{type: String, require: true},
   nombre_docente: {type: String, require: true}
});

module.exports = mongoose.model('Auditor_General', schema);