var jwt = require('jsonwebtoken');
var curso = require('../models/curso');
var area = require('../models/area');
var proyecto_docente = require('../models/proyecto_docente');
var Tema = require('../models/tema');
var compruebaperiodo = require('../models/comprueba_periodo');
var auditorgeneral = require('../models/auditor_general');
var Horario = require('../models/horario');
var Promise = require('promise');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var date = new Date();

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

exports.setDisponibility = ({ body: {id_programa, anno, periodo, disponibility} }, res, next) =>{
    compruebaperiodo.findOneAndUpdate({ id_programa: id_programa, anno: anno, periodo: periodo }, {$set: {secondsDisponibility: ( parseInt(disponibility) *3600 )}})
        .then(result =>{
            if(!result) return res.status(400).json({message: 'No data found'});
             return res.status(200).json({message: 'Disponibilidad modificada con exito'})
        })
        .catch(e =>{
            return res.status(400).json({message: e})
        })
};

exports.getDisponibility = ({ body: {id_programa, anno, periodo} }, res, next) =>{
    compruebaperiodo.findOne({ id_programa: id_programa, anno: anno, periodo: periodo })
        .then(result =>{
            if(!result) return res.status(400).json({message: 'No data found'});
            return res.status(200).json({disponibility: (result.secondsDisponibility / 3600 )})
        })
        .catch(e =>{
            return res.status(400).json({message: e})
        })
};

exports.asignaturainfo = function (req, res, next) {

    curso.findOne({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo}, function (err, c) {
        if(!c){
            return res.status(500).json({
                mensaje: 'Curso no encontrado'
            });
        }
        if(err){
            return res.status(400).json({
                mensaje: 'Error en la operacion '+err
            });
        }
        res.status(200).json({
            mensaje: c
        });
    });
};

exports.areainfo = function (req, res, next) {
    curso.findOne({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo ,anno:req.body.anno, periodo: req.body.periodo},function (err, curso) {
        if(err){
            return res.status(400).json({
                    mensaje: 'Error en la operacion de busqueda de area de un curso'+err
            });
        }
        if(!curso){
            return res.status(500).json({
                mensaje: 'Curso no encontrado'
            });
        }
        if(curso.id_area === 'vacio'){
            return res.status(500).json({
                mensaje: 'El curso no tiene departamento asociado.'
            });
        }
        area.findById(curso.id_area, function (err, area) {
            if(!area){
                return res.status(500).json({
                    mensaje: 'Area no encontrada'
                });
            }
            if(err){
                return res.status(400).json({
                    mensaje: 'Error en la operacion '+err
                });
            }
            res.status(200).json({
                nombre : area.nombre,
                id_docente : area.id_docente,
                nombre_docente: area.nombre_docente,
                _id: area._id
            });
        });
    });
};

exports.proyectodocenteinfo = function (req, res, next) {
    curso.findOne({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo, anno: req.body.anno, periodo: req.body.periodo }, function (err, curso) {
        if(!curso){
            return res.status(500).json({
                mensaje: 'Curso no encontrado'
            });
        }
        if(err){
            return res.status(400).json({
                mensaje: 'Error en la operacion '+err
            });
        }
        if(curso.id_proyecto === 'vacio'){
            return res.status(500).json({
                mensaje: 'El curso no tiene un proyecto docente asociado.'
            });
        }else {
            proyecto_docente.findById(curso.id_proyecto, function (err, proyecto) {
                if(err){
                    return res.status(400).json({
                        mensaje: 'Error en la operacion '+err
                    });
                }
                Tema.find({id_proyecto: curso.id_proyecto}, function (err, temas) {
                    if (!temas) {
                        return res.status(500).json({
                            mensaje: 'El proyecto docente no tiene temas asociados'
                        });
                    }
                    if (err) {
                        return res.status(400).json({
                            mensaje: 'Error en la operacion ' + err
                        });
                    }
                    res.status(200).json({
                        _id: proyecto._id,
                        nombre: proyecto.nombre,
                        objetivos: proyecto.objetivos,
                        competencias: proyecto.competencias,
                        bibliografia: proyecto.bibliografia,
                        anno: proyecto.anno,
                        periodo: proyecto.periodo,
                        temas: temas
                    });
                });
            });
        }
    })
};

exports.proyectodocente = function (req, res, next) {

    var fecha2 = date.getTime() + (184*24*60*60*1000);
    var fecha6 = new Date(fecha2);
    // Milisegundos de 3 días mas suma 3dias= 30*24*60*60*1000; (días * 24 horas * 60 minutos * 60 segundos * 1000 milésimas de segundo)

    var proyecto = new proyecto_docente({
        nombre: req.body.nombre,
        id_programa: req.body.id_programa,
        objetivos: req.body.objetivos,
        competencias: req.body.competencias,
        bibliografia: req.body.bibliografia,
        anno: req.body.anno,
        periodo: req.body.periodo,
        fecha_inicio: date, // milisegundos ''+(date.getDay())+'/'+(date.getMonth()+1)+'/'+date.getFullYear()
        fecha_fin: fecha6               //''+(date.getDay())+'/'+((date.getMonth()+1)+6)+'/'+date.getFullYear()
    });
    proyecto.save(function (err, result) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido '+err
            });
        }
        for(var i =0; i< req.body.temas.length; i++){
            var tema = new Tema({
                id_proyecto : result._id,
                nombre: req.body.temas[i].nombre,
                visto: req.body.temas[i].visto
            });
            tema.save();
        }

        res.status(201).json({
            mensaje: 'Proyecto docente creado con éxito.',
            id_proyecto: result._id
        });

    });
};

exports.iniciarperiodoacademico = function (req, res, next) {
    compruebaperiodo.findOne({id_programa: req.body.id_programa, anno: req.body.anno, periodo: req.body.periodo }, function (err, resultado) {
        if(err){
            return res.status(500).json({
                mensaje: 'Error en la busqueda de un comprueba-periodo '+err
            });
        }

        if(resultado){
            return res.status(200).json({
                mensaje: 'El periodo academico ya ha sido iniciado para este programa'
            });
        }

        var comprueba_periodo = new compruebaperiodo({
            id_programa: req.body.id_programa,
            anno: req.body.anno,
            periodo: req.body.periodo,
            estado: true,
            secondsDisponibility: (parseInt(req.body.disponibility) * 3600)
        });
        comprueba_periodo.save();

        var url = "http://190.242.62.234:8080/SIRECAARST/programacion/xprograma";
        var method = "POST";
        var postData = 'id_programa='+req.body.id_programa+'&anno='+req.body.anno+'&periodo='+req.body.periodo+'&token='+req.body.token_udc;
        var async = true;
        var request = new XMLHttpRequest();

        request.onload = function () {
            var status = request.status;
            var data = JSON.parse(this.responseText);

            if (status != 200) {
                return res.status(status).json({
                    mensaje: 'Error de peticion: ' + status
                });
            }

            var cursos_function = function saveCursos(course){
                return new Promise(resolve => {
                    var token = req.body.token_udc;
                    var c = new curso({
                        id_programa: req.body.id_programa,
                        id_asignatura: course.id_asignatura,
                        grupo: course.grupo,
                        nombre: course.nombre_asignatura,
                        id_proyecto: 'vacio',
                        id_area: 'vacio',
                        periodo : req.body.periodo,
                        anno : req.body.anno,
                        id_docente: course.id_docente,
                        tipo_asignatura: course.tipo_asignatura,
                        correo_docente: course.correo_docente,
                        nombre_docente: course.nombre_docente,
                        reforma_pensum: course.reforma_pensum
                    });
                    c.save(function (err, respuesta) {
                        if (err) {
                            return res.status(500).json({
                                mensaje: 'Error al guardar los cursos' + err
                            });
                        }
                        resolve(respuesta);
                    });
                });
            };
            var actions = data.map(cursos_function);
            var results = Promise.all(actions);

            var horarios_function = function getHorarios(course){
                return new Promise(resolve => {
                    var url = "http://190.242.62.234:8080/SIRECAARST/programacion/horario";
                    var method = "POST";
                    var postData = 'id_asignatura='+course.id_asignatura
                        +'&grupo='+course.grupo
                        +'&anno='+course.anno
                        +'&periodo='+course.periodo
                        +'&token='+token;

                    var async = true;
                    var request = new XMLHttpRequest();

                    request.onload = function () {

                        var status = request.status;
                        var data = JSON.parse(this.responseText);

                        if (status != 200) {
                            return res.status(status).json({
                                mensaje: 'Error de peticion: ' + status
                            });
                        }

                        resolve({course: course, schedule: data});
                    };

                    request.open(method, url, async);
                    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    request.send(postData);

                });
            };
            var horario_function = function saveHorarios(obj){
                return new Promise(resolve => {

                    var fn = function saveHorario(horario){
                        return new Promise(resolve => {
                            var weekday_name = "";

                            switch (horario.dia.toLowerCase().substring(0,2)){
                                case 'lu': weekday_name = "Lunes"; break;
                                case 'ma': weekday_name = "Martes"; break;
                                case 'mi': weekday_name = "Miércoles"; break;
                                case 'ju': weekday_name = "Jueves"; break;
                                case 'vi': weekday_name = "Viernes"; break;
                                case 'sa': weekday_name = "Sábado"; break;
                                case 'do': weekday_name = "Domingo"; break;
                            }

                            var h = new Horario({
                                id_curso: course._id,
                                id_asignatura : course.id_asignatura,
                                grupo: course.grupo,
                                dia: weekday_name,
                                h_inicio: horario.hora_inicio,
                                h_fin: horario.hora_fin,
                                fecha: horario.fecha,
                                registro: false,
                                periodo: course.periodo,
                                anno: course.anno
                            });

                            h.save(function (err, respuesta) {
                                if (err) {
                                    return res.status(500).json({
                                        mensaje: 'Error al guardar el horario' + err
                                    });
                                }
                                resolve(respuesta);
                            });
                        });
                    };
                    var actions = obj.schedule.map(fn, course = obj.course);
                    var results = Promise.all(actions);

                    results.then(
                        data => {
                            resolve();
                        }
                    )
                });
            };

            results.then(
                data => {
                    return Promise.all(data.map(horarios_function, token = req.body.token_udc));
                }
            ).then(
                data => {
                    return Promise.all(data.map(horario_function));
                }
            ).then(
                data => {
                    return res.status(200).json({
                        mensaje: 'Periodo academico iniciado con éxito.'
                    });
                }
            );
        };

        request.open(method, url, async);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(postData);

    });
};

exports.sincronizacion = async function(req, res, next){

    var url = "http://190.242.62.234:8080/SIRECAARST/programacion/xprograma";
    var method = "POST";
    var postData = 'id_programa='+req.body.id_programa+'&anno='+req.body.anno+'&periodo='+req.body.periodo+'&token='+req.body.token_udc;
    var async = true;
    var request = new XMLHttpRequest();

    request.onload = function () {
        var status = request.status;
        var data = JSON.parse(this.responseText);

        if (status != 200) {
            return res.status(status).json({
                mensaje: 'Error de peticion: ' + status
            });
        }

        var cursos_function = function saveCursos(course){
            return new Promise(resolve => {
                 curso.findOne({id_programa: req.body.id_programa, id_asignatura: course.id_asignatura, grupo: course.grupo, anno: req.body.anno, periodo:req.body.periodo },
                     function (err, curso) {
                        if(err){
                            return res.status(500).json({
                                mensaje: 'Error de peticion: ' + status
                            });
                        }
                        if (curso){
                            curso.id_docente = course.id_docente;
                            curso.tipo_asignatura =  course.tipo_asignatura;
                            curso.correo_docente =  course.correo_docente;
                            curso.nombre_docente =  course.nombre_docente;
                            curso.reforma_pensum = course.reforma_pensum;

                            curso.save();
                        }
                     });

                /*c.save(function (err, respuesta) {
                    if (err) {
                        return res.status(500).json({
                            mensaje: 'Error al guardar los cursos' + err
                        });
                    }
                    //resolve(respuesta);
                });*/
            });
        };
        var actions = data.map(cursos_function);
        var results = Promise.all(actions);

        results.then(
            data => {
                 return res.status(200).json({
                    mensaje: 'Sincronización Exitosa'
                });
            }
        );

        return res.status(200).json({
            mensaje: 'Sincronización Exitosa'
        });

    };

    request.open(method, url, async);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(postData);
};

exports.estadodelperiodo = function (req, res, next) {
    compruebaperiodo.findOne({id_programa: req.body.id_programa, anno: req.body.anno, periodo: req.body.periodo }, function (err, resultado) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error en la busqueda de un periodo '+err
            });
        }
        if(resultado){
            return res.status(200).json({
                mensaje: resultado.estado
            });
        }
        if(!resultado){
            return res.status(500).json({
                mensaje: false
            });
        }
    });
};

exports.modificaciondelperiodo = function (req, res, next) {
    compruebaperiodo.findOne({id_programa: req.body.id_programa, anno: req.body.anno, periodo: req.body.periodo }, function (err, resultado) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al modificar '+err
            });
        }
        if(resultado){
            resultado.estado = req.body.estado;
            resultado.save();
            return res.status(200).json({
                mensaje: 'Éxito al modificar el periodo'
            });
        }else{
            return res.status(500).json({
                mensaje: 'No se ha creado el periodo ingresado'
            });
        }
    });
};

exports.listaproyectosdocente = function (req, res, next) {
    proyecto_docente.find({id_programa: req.body.id_programa, anno: req.body.anno, periodo: req.body.periodo}, function (err, proyectos) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al listar los proyectos '+err
            });
        }
        if(!proyectos.length){
            return res.status(500).json({
                mensaje: 'No hay proyectos docentes asociados a este programa'
            });
        }

        proyectos.sort(function(a, b){
            return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
        });
        return res.status(200).json({
            mensaje: proyectos
        });
    });
};

exports.asignarproyectodocente = function (req, res, next) {
    curso.findOne({id_asignatura: req.body.id_asignatura , grupo: req.body.grupo, periodo: req.body.periodo, anno: req.body.anno }, function (err, curso) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error en la asignacion de proyecto docente '+err
            });
        }
        if(!curso){
            return res.status(500).json({
                mensaje: 'El curso que intenta buscar no existe'+err
            });
        }
        curso.id_proyecto = req.body.id_proyecto;
        curso.save();
        return res.status(200).json({
            mensaje: 'Proyecto docente asignado con éxito'
        });
    });
};

exports.cursosdeunproyecto = function (req, res, next) {
    curso.find({id_proyecto: req.body.id_proyecto}, function (err, cursos) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar los cursos de un proyecto docente '+err
            });
        }
        if(!cursos.length){
            return res.status(500).json({
                mensaje: 'No hay cursos asociados a este proyecto docente.'
            });
        }
        return res.status(200).json({
            mensaje: cursos
        });
    });
};

exports.temasdeunproyecto = function (req, res, next) {
    Tema.find({id_proyecto: req.body.id_proyecto}, function (err, temas) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar los temas de un proyecto docente '+err
            });
        }

        if(!temas.length){
            return res.status(500).json({
                mensaje: 'No hay temas asociados a este proyecto docente'
            });
        }

        return res.status(200).json({
            mensaje: temas
        });
    });
};

exports.creararea = function (req, res, next) {
    var Area = new area({
        nombre: req.body.nombre,
        id_programa: req.body.id_programa,
        id_docente: req.body.id_docente,
        nombre_docente: req.body.nombre_docente
    });
    Area.save(function (err, result) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error a ocurrido al crear el Area '+err
            });
        }
        res.status(201).json({
            mensaje: 'Departamento creado con éxito',
            id_area: result._id
        });
    });
};

exports.docentesdeunprograma = function (req, res, next) {

    var url = "http://190.242.62.234:8080/SIRECAARST/programacion/xprograma";
    var method = "POST";
    var postData = 'id_programa='+req.body.id_programa+'&anno='+req.body.anno+'&periodo='+req.body.periodo+'&token='+req.body.token_udc;
    var async = true;
    var request = new XMLHttpRequest();

    request.onload = function () {

        var status = request.status;
        var data = JSON.parse(this.responseText);

        if(status != 200){
            return res.status(status).json({
                mensaje: 'Error de Autenticación: '+ status
            });
        }

        var array = [];

        for(var i =0; i< data.length; i++){
            if(data[i].id_docente !=null)
                array.push({id: data[i].id_docente, nombre: data[i].nombre_docente});
        }

        let unique_array = array.filter(function(elem, index, self) {
            return index === self.map(function(s) { return s.id; }).indexOf(elem.id);
        });

        return res.status(200).json({
            mensaje: unique_array
        });

    };

    request.open(method, url, async);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(postData);
};

exports.cursosdeunprograma = function (req, res, next) {
    curso.find({id_programa: req.body.id_programa, anno: req.body.anno, periodo: req.body.periodo}, function (err, cursos) {

        if (err) {
            return res.status(500).json({
                mensaje: 'Un error al buscar los cursos '+err
            });
        }
        if(!cursos.length){
            return res.status(500).json({
                mensaje: 'No hay cursos asociados a este programa.'
            });
        }
        return res.status(200).json({
            mensaje: cursos
        });
    });
};

exports.asignarptoyectoavarios = function (req, res, next) {
    for(var i = 0; i< req.body.cursos.length; i++) {
        curso.findOne({id_asignatura: req.body.cursos[i].id_asignatura, grupo:req.body.cursos[i].grupo, anno: req.body.anno, periodo: req.body.periodo }, function (err, curso) {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al modificar el proyecto para una asignatura '+err
                });
            }
            if(curso){
                curso.id_proyecto = req.body.id_proyecto;
                curso.save();
            }else{
                return res.status(500).json({
                    mensaje: 'Hay un curso que no existe '+err // este curso que no existe esta dentro del array que se manda desde el front
                });
            }
        });
    }
    return res.status(200).json({
        mensaje: 'Todas las asignaciones han sido exitosas'
    });
};

exports.obtenerareas = function (req, res, next) {
    area.find({id_programa: req.body.id_programa}, function (err, areas) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al obtener todas las areas'+err
            });
        }

        if(!areas.length){
            return res.status(500).json({
                mensaje: 'No hay areas asociadas al programa academico'
            });
        }

        return res.status(200).json({
            mensaje: areas
        });
    });
};

exports.asignararea = function (req, res, next) {
    curso.findOne({id_asignatura: req.body.id_asignatura, grupo: req.body.grupo, anno: req.body.anno, periodo: req.body.periodo}, function (err, curso) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al modificar el area para la asignatura '+err
            });
        }
        if(curso){
            curso.id_area = req.body.id_area;
            curso.save();
        }else{
            return res.status(500).json({
                mensaje: 'Este curso no existe'
            });
        }

        return res.status(200).json({
            mensaje: 'Area asignada satisfactoriamente'
        });
    });
};

exports.asignarareaavarios = function (req, res, next) {

    for(var i = 0; i< req.body.cursos.length; i++) {
        curso.findOne({id_asignatura: req.body.cursos[i].id_asignatura, grupo:req.body.cursos[i].grupo, anno: req.body.anno, periodo: req.body.periodo }, function (err, curso) {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al modificar el area para una asignatura'+err
                });
            }
            if(curso){
                curso.id_area = req.body.id_area;
                curso.save();
            }else{
                return res.status(500).json({
                    mensaje: 'Hay un curso que no existe'+err // este curso que no existe esta dentro del array que se manda desde el front
                });
            }

        });
    }
    return res.status(200).json({
        mensaje: 'Todas las asignaciones han sido exitosas'
    });
};

exports.cursosdeunarea = function (req, res, next) {
    curso.find({id_area: req.body.id_area}, function (err, cursos) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al obtener los cursos de esta area '+err
            });
        }

        if(!cursos.length){
            return res.status(500).json({
                mensaje: 'No hay cursos asociados a este departamento.'
            });
        }

        return res.status(200).json({
            mensaje: cursos
        });
    });
};

exports.crearauditorgeneral = function (req, res, next) {
    auditorgeneral.findOne({id_docente: req.body.id_docente}, function (err, auditor) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error en validación de auditores generales'+err
            });
        }
        if(!auditor){

            var audg = new auditorgeneral({
                id_programa : req.body.id_programa,
                id_docente: req.body.id_docente,
                nombre_docente: req.body.nombre_docente
            });

            audg.save(function (err, result) {
                if (err) {
                    return res.status(500).json({
                        mensaje: 'Un error a ocurrido al crear el auditor general'+err
                    });
                }
                return res.status(201).json({
                    mensaje: 'Auditor general creado con éxito'
                });
            });
        }
        if(auditor) {
            return res.status(500).json({
                mensaje: 'Este docente ya es un auditor general'
            });
        }
    });

};

exports.eliminarauditorgeneral = ( { body: { id_docente } } , res, next) =>{
    auditorgeneral.findOneAndRemove({id_docente: id_docente}, function (err, auditor) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido al intentar eliminar el auditor general: ' + err
            });
        }
        if(!auditor){
            return res.status(500).json({
                mensaje: 'Auditor general no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Auditor eliminado con éxito.'
        });
    });
};

exports.auditoresgeneralesprograma = function (req, res, next) {
    auditorgeneral.find({id_programa: req.body.id_programa}, function (err, docentes) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error a ocurrido al buscar los auditores generales '+err
            });
        }
        if(!docentes.length){
            return res.status(500).json({
                mensaje: 'No hay auditores generales asociados a este programa'
            });
        }
        return res.status(200).json({
            mensaje: docentes
        });
    });
};

exports.desvinculararea = function (req, res, next) {
    curso.findOne({id_asignatura: req.body.id_asignatura,
                    grupo: req.body.grupo,
                    anno: req.body.anno,
                    periodo: req.body.periodo
    }, function (err, curso) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido al buscar el curso: '+err
            });
        }
        if(!curso){
            return res.status(500).json({
                mensaje: 'Curso no encontrado'
            });
        }else{
           curso.id_area = "vacio";
           curso.save();

           return res.status(200).json({
                mensaje: "Departamento desvinculado con éxito."
            });
        }
    });
};

exports.editararea = function (req, res, next) {

    var updated_area = {
        nombre: req.body.area.nombre,
        id_docente: req.body.area.id_docente,
        nombre_docente: req.body.area.nombre_docente
    };

    area.findOneAndUpdate({_id: req.body.area._id}, updated_area, function (err, area) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido al intentar almacenar los cambios para el departamento interno: '+err
            });
        }

        if (!area) {
            return res.status(500).json({
                mensaje: 'Departamento interno no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Departamento interno editado con éxito.'
        });
    });
};

exports.eliminararea = function (req, res, next) {
    /*curso.findOne({id_area: req.body.id_area}, function (err, curso) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido en la búsqueda de un curso asociado al departamento interno '+err
            });
        }
        if(!curso){

        }else{
            return res.status(500).json({
                mensaje: 'El departamento interno tiene cursos asociados, por lo tanto no se puede eliminar.'
            });
        }
    });*/
    area.findByIdAndRemove({_id: req.body.id_area}, function (err, area) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido al intentar eliminar el departamento interno: ' + err
            });
        }
        if(!area){
            return res.status(500).json({
                mensaje: 'Departamento interno no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Departamento eliminado con éxito.'
        });
    });
};

exports.desvincularproyectodocente = function (req, res, next) {
   curso.findOne({id_asignatura: req.body.id_asignatura,
                  grupo: req.body.grupo,
                  anno: req.body.anno,
                  periodo: req.body.periodo
   }, function (err, curso) {
       if (err) {
           return res.status(500).json({
               mensaje: 'Un error ha ocurrido durante la búsqueda del curso: '+err
           });
       }
       if(!curso){
           return res.status(500).json({
              mensaje: "Curso no encontrado"
           });
       }else{
           curso.id_proyecto = "vacio";
           curso.save();
           return res.status(200).json({
               mensaje: "Proyecto docente desvinculado con éxito."
           });
       }
   });
};

exports.editarproyectodocente = function (req, res, next) {
   var updated_proyecto_docente = {
       objetivos: req.body.proyecto_docente.objetivos,
       competencias: req.body.proyecto_docente.competencias,
       bibliografia: req.body.proyecto_docente.bibliografia
   };
   proyecto_docente.findOneAndUpdate({_id: req.body.proyecto_docente._id}, updated_proyecto_docente, function (err, proyecto_docente) {
       if (err) {
           return res.status(500).json({
               mensaje: 'Un error ha ocurrido al intentar almacenar los cambios sobre el proyecto docente: '+err
           });
       }
       if (!proyecto_docente) {
           return res.status(500).json({
               mensaje: 'Proyecto docente no encontrado'
           });
       }else{
           return res.status(200).json({
               mensaje: 'Proyecto docente editado con éxito.'
           });
       }
   });
};

exports.editartema = function (req, res, next) {
   Tema.findOneAndUpdate({_id: req.body._id}, {nombre: req.body.nombre}, function (err, tema) {
       if (err) {
           return res.status(500).json({
               mensaje: 'Un error ha ocurrido al intentar almacenar los cambios sobre el tema: '+err
           });
       }
       if (!tema) {
           return res.status(500).json({
               mensaje: 'Tema no encontrado'
           });
       }else{
           return res.status(200).json({
               mensaje: 'Tema modificado con éxito.'
           });
       }
   });
};

exports.eliminartema = function (req, res, next) {
    Tema.findOne({_id: req.body._id}, function (err, tema) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido en la búsqueda del tema: '+err
            });
        }
        if (!tema) {
            return res.status(500).json({
                mensaje: 'Tema no encontrado'
            });
        }else{
            if(!tema.visto){
                Tema.findByIdAndRemove({_id: req.body._id}, function (err, temael) {
                    if (err) {
                        return res.status(500).json({
                            mensaje: 'Un error ha ocurrido al intentar eliminar el tema: ' + err
                        });
                    }
                    if(!temael){
                        return res.status(500).json({
                            mensaje: 'Tema no encontrado'
                        });
                    }
                    return res.status(200).json({
                        mensaje: 'Tema eliminado con éxito.'
                    });
                });

            }else{
                return res.status(500).json({
                    mensaje: 'El tema que desea borrar se encuentra asociado a un registro de asistencia académica.'
                });
            }
        }
    });
};

exports.nuevotema = function (req, res, next) {
    var nuevo_tema = new Tema({
        id_proyecto: req.body.id_proyecto,
        nombre: req.body.nombre,
        visto: false
    });
    nuevo_tema.save(function (err, result) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido al crear el tema: '+err
            });
        }
        return res.status(200).json({
            mensaje: result._id
        });
    });
};

exports.eliminarproyectodocente = function (req, res, next) {
    curso.findOne({id_proyecto: req.body.id_proyecto}, function (err, curso) {
        if (err) {
            return res.status(500).json({
                mensaje: 'Un error ha ocurrido al buscar los cursos de un proyecto docente: ' + err
            });
        }
        if(curso){
            return res.status(500).json({
                mensaje: 'El proyecto docente tiene cursos asociados, por lo tanto no se puede eliminar.'
            });
        }else{
            Tema.findOne({id_proyecto: req.body.id_proyecto, visto: true}, function (err, tema) {
                if (err) {
                    return res.status(500).json({
                        mensaje: 'Un error ha ocurrido al buscar los temas de un proyecto docente: ' + err
                    });
                }
                if(tema){
                    return res.status(500).json({
                        mensaje: 'El proyecto docente tiene temas que se han utilizado en registros de asistencia, por ' +
                        'lo tanto no se puede eliminar.'
                    });
                }else{
                    proyecto_docente.findByIdAndRemove({_id: req.body.id_proyecto}, function (err, proyecto_docente) {
                        if (err) {
                            return res.status(500).json({
                                mensaje: 'Un error ha ocurrido al intentar eliminar el proyecto docente: ' + err
                            });
                        }
                        if(!proyecto_docente){
                            return res.status(500).json({
                                mensaje: 'Proyecto docente no encontrado'
                            });
                        }

                        var array = [];

                        array.push(proyecto_docente);

                        //Eliminamos los temas del proyecto docente
                        var borrar_temas_function = function deleteTemas(proyecto_docente){
                            return new Promise((resolve, reject) => {
                                Tema.remove({id_proyecto: proyecto_docente._id}, function (err, temas) {
                                    if (err) {
                                        return res.status(500).json({
                                            mensaje: 'Error al eliminar los temas del proyecto docente: '+err
                                        });
                                    }

                                    if(temas){
                                        resolve();
                                    }
                                });
                            });
                        };

                        var actions = array.map(borrar_temas_function);
                        var results = Promise.all(actions);

                        results.then(
                            data => {
                                return res.status(200).json({
                                    mensaje: 'Proyecto docente eliminado con éxito.'
                                });
                            }
                        );

                    });
                }
            });
        }
    })
};