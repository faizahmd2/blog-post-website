'use strict';

let express = require('express');
let config = require('./config/config');
let cookieParser = require('cookie-parser');
let sessionMiddleware = require('./config/middlewares/session')
const { CustomError } = require('./config/middlewares/Error');
const rateLimit = require("express-rate-limit");
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');

module.exports = function(app, passport) {
    console.log('Initializing Express');

    // let allowedOrigins = config.allowedHeaders;

    app.all('/*', function (req, res, next) {
        // CORS headers
        // let origin = req.headers.origin;
        //console.log(origin);
        // if(allowedOrigins.indexOf(origin) > -1){
        //      res.setHeader('Access-Control-Allow-Origin', origin);
        // } // restrict it to the required domain

        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Credentials','true');
        // Set custom headers for CORS
        res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token');
        if (req.method == 'OPTIONS') {
            res.status(200).end();
        } else {
            next();
        }
    });

    //MIDDLEWARE
    app.use(express.static('public'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(fileUpload({}));
    app.use(
        methodOverride('_method', {
            methods: ['POST', 'GET'],
        })
    );

    //set public static path and set view engine to ejs
    // app.set('views', config.root + '/public/views');
    app.set("view engine", "ejs");

    //cookieParser above session
    app.use(cookieParser())

    // Rate Limit
    // app.use(rateLimit(config.RATE_LIMIT || 10));

    //express session configuration
    app.use(sessionMiddleware);

    //use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // app.use(express.static('public')); 
    // app.use('/images', express.static('images'));

    require('./app/routes')(app);

    app.get('*',  function (req, res) {
        new CustomError(res);
    });
};
