var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var appRoutes = require('./routes/app');
var docenteRoutes = require('./routes/docente');
var adminRoutes = require('./routes/administrador');
var sistemRoutes = require('./routes/sistema');
var estudianteRoutes = require('./routes/estudiante');
var auditorRoutes = require('./routes/auditor');

// de prueba
var app = express();

mongoose.connect('mongodb://root:bdatos@ds243295.mlab.com:43295/sirecaa-platform');
//Conect

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});

app.use('/sistema', sistemRoutes);
app.use('/estudiante', estudianteRoutes);
app.use('/auditor', auditorRoutes);
app.use('/administrador', adminRoutes);
app.use('/docente', docenteRoutes);
app.use('/', appRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
res.render('index');
});

module.exports = app;
