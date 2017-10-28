var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    objetivos: [{type: String, required: true}], // esta por verificar
    competencias: [{type: String, required: true}],
    bibliografia: [{type: String, required: true}],
    fecha_inicio: {type: String, required: true},
    fecha_fin: {type: String, required: true}
});

module.exports = mongoose.model('Proyecto_Docente', schema);