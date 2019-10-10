var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    nombre: {type: String, required: true},
    id_programa: {type: String, required: true},
    id_docente: {type: String, required: true},
    nombre_docente: {type: String, required: true}
});

module.exports = mongoose.model('Area', schema);