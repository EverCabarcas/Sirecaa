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

module.exports = router;