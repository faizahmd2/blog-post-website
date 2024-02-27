const session = require("express-session");
const memoryStore = new session.MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
});

const config = require('../config');

var sessionMiddleware = session({
    cookie: { maxAge: 86400000 },
    store: memoryStore,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
    secret: config.EXPRESS_SESSION_SECRET
})

module.exports = sessionMiddleware