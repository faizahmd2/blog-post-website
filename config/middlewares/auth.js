const { sendResponse } = require('../../helper/util');
const { verify } = require('./jwt');

var exportAuth = {
    requireLogin: function(req, res, next) {
        if(!req.user) {
            sendResponse(res, 401, req.tokenMessage || 'User is not Authenticated');
        }
        next();
    },
    userTokenInfo: function(req, res, next) {
        const token = req.cookies && req.cookies.token;
        if (!token) {
            req.tokenMessage = 'Invalid Authorization';
            return next();
        }
    
        try {
            let result = verify(token);

            req.user = result;

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
    }
    
}

module.exports = exportAuth;