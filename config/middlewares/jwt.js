const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');

exports.sign = function(data) {
    return jwt.sign(data, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

exports.verify = function(token) {
    return jwt.verify(token, JWT_SECRET);
}
