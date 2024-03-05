
const passport = require('passport');
const bcrypt = require("bcryptjs");
const LocalStrategy = require('passport-local').Strategy;
const Login = require('../app/models/Login');

passport.use(new LocalStrategy({usernameField: 'username', passwordField: 'password'},async function(username, password, done) {
    let user = await Login.findOne({username: username, status: 1});
    if (!user) return done(null, false, { message: 'Unknown User' });

    // User found check password
    if(!(await bcrypt.compare(password, user.password))) {
        return done(null, false, { message: 'Incorrect Password' });
    }

    // User Found and Password Matched
    return done(null, user);
}));

module.exports = passport;