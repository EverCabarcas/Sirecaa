var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    id_programa: {type: String, required: true},
    anno: {type: String, required: true},
    periodo: {type: String, required: true},
    estado: {type: Boolean, required: true},
    secondsDisponibility: {type: Number, required: true}
});

module.exports = mongoose.model('Comprueba_Periodo', schema);