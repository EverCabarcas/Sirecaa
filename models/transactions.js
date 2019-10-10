var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    user: {
        nombre: {type: String, required: true},
        correo: {
            type: String,
            trim: true,
            lowercase: true,
            required: 'Email address is required',
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        programa: {type: String, required: true},
        perfil: {type: String, required: true}
    },
    accion: {type: String, required: true},
    predicado: {type: String, required: true},
    fecha: {type: Date, required: true},
    extra_data: {
        anno: {type: String, required: true},
        periodo: {type: String, required: true}
    },
});


module.exports = mongoose.model('Transaction', schema, 'Transaction');