const { sendResponse, errorTemplate } = require('../../helper/util');
const { verify } = require('./jwt');

var exportAuth = {
    requireLoginApi: function(req, res, next) {
        if(!req.user) {
            return sendResponse(res, 401, req.tokenMessage || 'User is not Authenticated');
        }
        next();
    },
    requireLoginPage: function(req, res, next) {
        console.log(req.url);
        if(!req.user) {
            let options = {
                title: "UNAUTHORIZED",
                sub_title: "Please login to access page content",
                message: "The Page you are looking for requires login to get accessed",
                redirect: "/login",
                button: "LOGIN"
            };
            return errorTemplate(res, options);
        }
        next();
    },
    userTokenInfo: function(req, res, next) {
        let url = req.url;
        if(url.includes(".")) return next();
        req.options = {};
        
        const token = req.cookies && req.cookies.token;
        if (!token) {
            req.tokenMessage = 'Invalid Authorization';
            return next();
        }
        
        try {
            let result = verify(token);

            req.user = result;

            if(!url.includes("/api/")) {
                req.options['user'] = result;
            }

            next();
        } catch (error) {
            console.log("catche error auth token valiation:",error);
            if (error.name === "TokenExpiredError") {
                eq.tokenMessage = 'Token expired';
                return next();
            }

            eq.tokenMessage = 'Invalid token';
            return next();
        }
    },
    isApi: function(req, res, next) {
        const isapi = req.headers && req.headers['x-api-request'];
        if(isapi == "true") {
            next();
        } else {
            sendResponse(res, 401, "INVALID REQUEST");
        }
    }
}

module.exports = exportAuth;