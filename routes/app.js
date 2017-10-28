var express = require('express');
var router = express.Router();
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var jwt = require('jsonwebtoken');


router.post('/signin', function (req, res, next) {
    var url = "http://190.242.62.234:8080/SIRECAARST/login";
    var method = "POST";
    var postData = 'usuario='+req.body.usuario+'&contrasena='+req.body.contrasena;

// You REALLY want async = true.
// Otherwise, it'll block ALL execution waiting for server response.
    var async = true;

    var request = new XMLHttpRequest();

// Before we send anything, we first have to say what we will do when the
// server responds. This seems backwards (say how we'll respond before we send
// the request? huh?), but that's how Javascript works.
// This function attached to the XMLHttpRequest "onload" property specifies how
// the HTTP response will be handled.
    request.onload = function () {

        // Because of javascript's fabulous closure concept, the XMLHttpRequest "request"
        // object declared above is available in this function even though this function
        // executes long after the request is sent and long after this function is
        // instantiated. This fact is CRUCIAL to the workings of XHR in ordinary
        // applications.

        // You can get all kinds of information about the HTTP response.
        var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
        var data = JSON.parse(this.responseText); // Returned data, e.g., an HTML document.
        if(status != 200){
            return res.status(status).json({
               message: 'Error de Autenticación: '+ status
            });
        }
        var token = jwt.sign({}, 'sirecaa_secret', {expiresIn: 1800 });
        return res.status(200).json({
            message:  data,
            token_udc: request.getResponseHeader('authorization'),
            token_sirecaa : token
        });
    };

    request.open(method, url, async);

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
// Or... request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
// Or... whatever

// Actually sends the request to the server.
    request.send(postData);
});

module.exports = router;
