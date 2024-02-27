const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoginSchema = new Schema({
    name: String,
    email: String,
    password: String,
    status: Number,
    phone: Number,
    address: String,
    pincode: Number,
    additionals: Schema.Types.Mixed,
    created: {
        type: Date
    },
    modified: {
        type: Date,
        default: Date.now
    },
});

const Login = mongoose.model('login', LoginSchema);

module.exports = Login;