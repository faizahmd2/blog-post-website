const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoginSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    name: String,
    initial: String,
    email: String,
    password: String,
    status: Number,
    phone: Number,
    address: String,
    pincode: Number,
    age: String,
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