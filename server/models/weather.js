const mongoose = require('mongoose');

let weather = mongoose.model ('weather',{
    id: Number,
    date:  Date,
    location: {
        lat: Number,
        lon: Number,
        city: String,
        state: String
    },
    temperature: []

});

module.exports = {weather};