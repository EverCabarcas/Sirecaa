var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    id_asignatura: {type: String, required: true},
    grupo: {type: String, required: true},
    nombre: {type: String, required: true},
    id_proyecto: {type: Schema.Types.ObjectId, ref: 'Proyecto_Docente', required: true},
    id_area: {type: Schema.Types.ObjectId, ref: 'Area', required: true}
});

module.exports = mongoose.model('Asignatura', schema);