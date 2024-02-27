const config = require('../config')

var exportAuth = {
    requiresLogin: function (req, res, next) {
        if(config.isAuthenticationEnabled && !req.isAuthenticated()) {
            return res.status(403).send({
                message: 'User is not Authenticated'
            })
        } else {
            next()
        }
    }
}

module.exports = exportAuth;