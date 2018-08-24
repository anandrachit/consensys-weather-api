const mongoose = require('mongoose');

let weather = mongoose.model ('weather',{
    id: {
        type: Number,
        required: true
    } ,
    date: {
        type: Date
    } ,
    temprature : []

});

module.exports = {weather};