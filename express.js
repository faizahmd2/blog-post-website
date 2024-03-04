'use strict';

let express = require('express');
let config = require('./config/config');
let cookieParser = require('cookie-parser');
const { errorTemplate } = require('./helper/util');
const rateLimit = require("express-rate-limit");
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
const { userTokenInfo } = require('./config/middlewares/auth');

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
    app.use(cookieParser())
    
    app.use(passport.initialize());
    app.use(userTokenInfo)

    app.set("view engine", "ejs");


    // Rate Limit
    // app.use(rateLimit(config.RATE_LIMIT || 10));


    require('./app/routes')(app);

    app.get('*',  function (req, res) {
        errorTemplate(res);
    });
};
