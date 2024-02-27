const mongoose = require('mongoose');
let config = require('./config');

mongoose.connect(config.MONGO_URI);

// var db = mongoose.createConnection(config.MONGO_URI);
// db.on('error', function (err) {
//    console.log('Mongoose default connection error: ' + err);
// });

// db.once('open', function callback() {
//     console.log('Mongoose default connection is open');
// });

// db.on('disconnected', function () {  
//   console.log('Mongoose default connection disconnected'); 
// });

// process.on('SIGINT', function() {  
//   db.close(function () { 
//     console.log('Mongoose default connection disconnected through app termination.'); 
//     process.exit(0); 
//   }); 
// });  

// module.exports = db;

