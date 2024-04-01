const express = require('express');
const app = express();
require('dotenv').config();
const config = require('./config/config')

console.log('Config loaded: '+config.NODE_ENV);
require('./config/mongo')

const passport = require('./config/passport');

require('./express')(app, passport);

app.listen(config.PORT);
console.log('Express app started on port ' + config.PORT);