// Requiring installed libraries
const _ = require('lodash');
const express = require('express');
const bodyPraser = require('body-parser'); 
const {ObjectID} = require('mongodb');

// Requiring local libraries
const {mongoose} = require('./db/mongoose');
const weather = require('./models/weather');

// defining the port to be used for this app
const port = process.env.PORT || 3000;

let app = express();

app.use(bodyPraser.json());

// The code for all the post and get requests will come here.

// The code for the weather POST request
app.post('/weather', (req,res) => {
    res.send('This is the return for post');
});

app.get('/weather', (req, res) => {
    res.send('This is from the get body');
})

app.listen(port, () => {
    console.log(`Started on port ${port}`);
})