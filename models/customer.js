const mongoose = require('mongoose');  // connect to mongo database
const Schema = mongoose.Schema;  // mongoose schema

const CustomerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    note: String   
});

module.exports = mongoose.model('Customer', CustomerSchema)