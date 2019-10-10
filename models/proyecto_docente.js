var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    id_programa: {type: String, required: true},
    nombre: {type: String, required: true},
    objetivos: [{type: String, required: true}], // esta por verificar
    competencias: [{type: String, required: true}],
    bibliografia: [{type: String, required: true}],
    fecha_inicio: {type: Date, required: true},
    fecha_fin: {type: Date, required: true},
    anno: {type: String, required: true},
    periodo:{type: String, required: true}
});

module.exports = mongoose.model('Proyecto_Docente', schema);