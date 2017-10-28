var express = require('express');
var router = express.Router();
var curso = require('../models/curso');
var jwt = require('jsonwebtoken');

router.use('/', function (req, res, next) {
    jwt.verify(req.query.token_sirecaa, 'sirecaa_secret', function (err, decoded) {
        if (err) {
            return res.status(401).json({
                title: 'No Autenticado',
                error: err
            });
        }
        next();
    })
});
router.post('/asignatura/proyecto', function (req, res, next) {
    curso.findOne({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo}, function (err, c) {
        if(!c){
            return res.status(500).json({
                estado : false
            })
        }
        if(err){
            return res.status(400).json({
                estado : "Error en la operacion"
            })
        }
        res.status(200).json({
                estado : true,
                dato : c
        })
    })
});

module.exports = router;