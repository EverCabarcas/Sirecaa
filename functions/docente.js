var jwt = require('jsonwebtoken');
var curso = require('../models/curso');
var tema_model = require('../models/tema');
var tema_visto_model = require('../models/tema_visto');
var horario = require('../models/horario');
var registro_model = require('../models/registros');
var asistencia_model = require('../models/asistencia');
var comprueba_periodo = require('../models/comprueba_periodo');
const https = require('http');

exports.autenticacion = function (req, res, next){
    jwt.verify(req.query.token_sirecaa, 'sirecaa_secret', function (err, decoded) {
        if (err) {
            return res.status(401).json({
                mensaje: 'Tiempo de sesion finalizado',
                error: err
            });
        }
        next();
    })
};

exports.getcursosdocente = ( { query: { id_docente, anno, periodo, token_udc } }, res, next ) =>{
    const options = {
        host: '190.242.62.234',
        port: 8080,
        path: '/SIRECAARST/docente/asignaturas?id_docente='+id_docente+'&anno='+anno+'&periodo='+periodo+'&token='+token_udc,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    const resp = https.request(options, (response) => {
        console.log('statusCode:', response.statusCode);
        console.log('headers:', response.headers);
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            return res.status(200).json(JSON.parse(data))
        });
    });
    resp.on('error', (e) => {
        return res.status(400).json(e)
    });
    resp.end();
};

exports.validaregistros =  function  (req, res, next) {
    var now= new Date(); // Conseguimos los datos de la fecha actual
    var nowday= now.getDate();  // Día actual
    var nowhour= now.getHours();  // Hora actual
    var nowminute= now.getMinutes(); // Minuto actual
    var nowsecond= now.getSeconds();  // Segundo actual
    var nowanno = now.getFullYear();
    var nowmonth = now.getMonth();
    var tiempo2 = new Date(nowanno,nowmonth, nowday, nowhour, nowminute, nowsecond, 0);
    var schedule = [];

    horario.find({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo, periodo: req.body.periodo, anno: req.body.anno}, async function (err, horarios) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar los horarios '+err
            });
        }
        if(!horarios.length){
            return res.status(500).json({
                mensaje: 'No hay horarios asociados a este curso'
            });
        }
        for(var i = 0; i < horarios.length; i++) {
            //schedule.push(horarios[i]); //Esto es para listar todos los horarios.

            if (horarios[i].registro == false) {

                var hym = horarios[i].h_inicio.split(':');

                var fecha = horarios[i].fecha.split('-');
                //var m = parseInt(fecha[1], 10);
                var tiempo1 = new Date(parseInt(fecha[0]),parseInt(fecha[1]) -1, parseInt(fecha[2]), parseInt(hym[0]), parseInt(hym[1]), 0, 0);

                if(tiempo1 <= tiempo2){

                    var dif = tiempo2.getTime() - tiempo1.getTime();

                    var Segundos_de_T1_a_T2 = dif / 1000;

                    var Segundos_entre_fechas = Math.abs(Segundos_de_T1_a_T2);
                    // Aquí validamos que el horario sea menor o igual a 48 horas(172800 segundos)
                    //por nuevo requerimiento cambiamos este valor a configurable
                    let result = await comprueba_periodo.findOne({id_programa: req.body.id_programa, periodo: req.body.periodo, anno: req.body.anno})
                    if ((Segundos_entre_fechas <= result.secondsDisponibility)) {
                                schedule.push(horarios[i])
                        }
                }

                hym = [];
                fecha = [];
            }
        }

        res.status(200).json({
            message : schedule
        });
    });
};

exports.crearregistro = function (req, res, next) {
    var now = new Date(); // Fecha actual.
    var nowday = now.getDate();  // Día actual
    var nowhour = now.getHours();  // Hora actual
    var nowminute = now.getMinutes(); // Minuto actual
    var nowanno = now.getFullYear();
    var nowmonth = now.getMonth()+1;
    var weekday = now.getDay();

    var weekday_name = "";

    // Anteponer 0 a valores entre 1 y 9
    if(nowday >= 1 && nowday <= 9){
        nowday = '0'+nowday;
    }
    if(nowmonth >= 1 && nowmonth <= 9){
        nowmonth = '0'+nowmonth;
    }
    if(nowhour >= 1 && nowhour <= 9){
        nowhour = '0'+nowhour;
    }
    if(nowminute >= 1 && nowminute <= 9){
        nowminute = '0'+nowminute;
    }

    //Obtener día de la semana
    switch (weekday){
        case 1:
            weekday_name = "Lunes";
            break;
        case 2:
            weekday_name = "Martes";
            break;
        case 3:
            weekday_name = "Miércoles";
            break;
        case 4:
            weekday_name = "Jueves";
            break;
        case 5:
            weekday_name = "Viernes";
            break;
        case 6:
            weekday_name = "Sábado";
            break;
        case 0:
            weekday_name = "Domingo";
            break;
    }

    /*var day_options = { weekday: 'long' };
    var time_options = { minute: 'numeric', second: 'numeric' };

    var day = date.toLocaleDateString('es-ES', {weekday: 'long'});
    var time = date.toLocaleDateString('es-MX', time_options);

    var full_date = time.split(', ');

    return res.status(500).json({
        day: day
    });*/

    var registro = new registro_model({
        id_asignatura: req.body.id_asignatura,
        grupo: req.body.grupo,
        id_horario: req.body.id_horario,
        dia_registro: weekday_name,
        fecha_registro: nowanno+"-"+nowmonth+"-"+nowday,
        hora_registro: nowhour+":"+nowminute,
        observaciones: req.body.observaciones,
        otros_temas: req.body.otros_temas,
        anno: req.body.anno,
        periodo: req.body.periodo
    });

    registro.save(function (err, result) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido: '+err
            });
        }

        for(var i =0; i< req.body.asistencia.length; i++){
            var asistencia = new asistencia_model({
                id_registro: result._id,
                id_estudiante: req.body.asistencia[i].id_estudiante,
                nombre_estudiante: req.body.asistencia[i].nombre_estudiante,
                inasistencia:  req.body.asistencia[i].inasistencia
            });
            asistencia.save();
        }

        for(var j =0; j< req.body.temas.length; j++){

            if(req.body.temas[j].visto){
                tema_model.findOneAndUpdate({_id: req.body.temas[j]._id}, {visto: true}, function (err, tema) {
                    if (err) {
                        return res.status(500).json({
                            mensaje: 'Error al intentar actualizar uno de los temas: '+err
                        });
                    }

                    if (!tema) {
                        return res.status(500).json({
                            mensaje: 'Error, tema no encontrado: '+err
                        });
                    }
                });

                var tema_visto = new tema_visto_model({
                    id_registro: result._id,
                    id_tema: req.body.temas[j]._id
                });
                tema_visto.save();
            }
        }

        horario.findOneAndUpdate({_id: req.body.id_horario}, {registro: true}, function (err, horario) {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al intentar actualizar el horario: '+err
                });

            }
            if (!horario) {
                return res.status(500).json({
                    mensaje: 'Error, horario no encontrado: '+err
                });
            }

        });

        return res.status(201).json({
            mensaje: 'Registro creado con éxito.'
        });

    });
};