// Requiring installed libraries
const _ = require('lodash');
const express = require('express');
const bodyPraser = require('body-parser'); 
const {ObjectID} = require('mongodb');

// Requiring local libraries
const {mongoose} = require('./db/mongoose');
const {weather} = require('./models/weather');

// defining the port to be used for this app
const port = process.env.PORT || 3000;

let app = express();

app.use(bodyPraser.json());

// The code for all the post and get requests will come here.

// The code for the weather POST request to add a new Weather record to the DB
app.post('/weather', (req,res) => {
    weather.findOne({'id':req.body.id}).then( (weatherInfo) => {
        if(weatherInfo){
            return res.status(400).send();
        }
        let Weather = new weather({
            id: req.body.id,
            date: req.body.date,
            location: req.body.location,
            temperature: req.body.temperature
        });
        Weather.save().then((weather) => {
        res.status(200).send(weather);
    }); 

    }, e => {
        res.status(404).send(e);
    });
});

function compare(a,b) {
    const idOfA =  a.id
    const idOfB = b.id;

    let comparison = 0;
    if ( idOfA > idOfB){
        comparison = 1;
    } else if( idOfA < idOfB){
        comparison = -1;
    }
    return comparison;
}

// Code for GETting the weather data. If latitude and longitude are provided, then the weather for that location are returned, else the weather for all the records are sent back
app.get('/weather', (req, res) => {
    let latitude = req.query.lat;
    let longitude = req.query.lon;
    if (latitude === undefined || longitude===undefined){
        weather.find().then((weatherInfo) => {
            res.status(201).send(weatherInfo.sort(compare));
        })
    } else {
        weather.find({'location.lat': latitude, 'location.lon': longitude}).then((weatherInfo) =>{
            if (weatherInfo){
                res.status(200).send(weatherInfo.sort(compare));
            }
            return res.status(404).send('Location not found');
        }, (e) => {
            res.status(400).send(e);
        });
    }
});

// Code to delete all weather data.
app.delete('/erase', (req, res) => {
    let startDate = req.query.start;
    let endDate = req.query.end;
    let latitude = req.query.lat;
    let longitude = req.query.lon;
    if ( startDate === undefined || endDate === undefined || latitude === undefined || longitude === undefined){
        weather.deleteMany({}).then( (deleteRecord) => {
            return res.status(200).send(`Deleted ${deleteRecord.n} weather records`)
        });
    }
    weather.deleteMany({'date': {$gte: startDate, $lte: endDate}, 'location.lat': latitude, 'location.lon': longitude}).then((deletedRecordsInfo) => {
        return res.status(200).send(`Deleted ${deletedRecordsInfo.n} weather records`);
    })
});

function sortByMany(a,b){
    let returnValue = 1;
    if ( a.city > b.city){
        returnValue = 1;
    } else if (a.city < b.city){
        return value = -1 ;
    } else {
        if (a.state > b.state){
            returnValue = 1;
        } else if (a.state < b.state ){
            returnValue = -1;
        }
    } 

    return returnValue;
}

// Code to fetch min and max temprature for all cities for a given date range
app.get('/weather/temprature', (req, res) => {
    // Fetching the Start and End dates for the date range
    let startDate = req.query.start;
    let endDate = req.query.end;

    // Defining the empty array that will be used to return the weather for the cities
    let returnWeather = [];
    
    // Finding all cities that have temprature data in the given date rannge
    weather.find({'date': {$lte: endDate, $gte: startDate}}).then((weatherInfo)=> {
        for( i=0; i< weatherInfo.length; i++){
            let filteredWeather = returnWeather.filter( (weatherObject) => {
                return weatherObject.city === weatherInfo[i].location.city && 
                        weatherObject.state === weatherInfo[i].location.state;
            });
            if(filteredWeather.length === 0){
                let newCity = {
                    lat: weatherInfo[i].location.lat,
                    lon: weatherInfo[i].location.lon, 
                    city: weatherInfo[i].location.city,
                    state: weatherInfo[i].location.state,
                    minTemp: Math.min.apply(null,weatherInfo[i].temperature),
                    maxTemp: Math.max.apply(null,weatherInfo[i].temperature)
                };
                returnWeather.push(newCity);
            } else {
                let currentMinTemp = filteredWeather[0].minTemp;
                let currentMaxTemp = filteredWeather[0].maxTemp;
                let newMinTemp = Math.min.apply(null, weatherInfo[i].temperature);
                let NewMaxTemp = Math.max.apply(null, weatherInfo[i].temperature);
                // Checking if new Min temp is less than current Min Temp
                if( newMinTemp < currentMinTemp){
                    // New Min temp found, needs to be changed
                    // finding the record in the return array with this city
                    let k;
                    for (k=0; k< returnWeather.length; k++){
                        if( returnWeather[k].city === weatherInfo[i].location.city && returnWeather[k].state === weatherInfo[i].location.state){
                            returnWeather[k].minTemp = newMinTemp;
                        }
                    }

                }
                //Checking if new max temp is more than current max temp
                if (currentMaxTemp < NewMaxTemp){
                    let j;
                    for (j=0; j< returnWeather.length; j++){
                        if(returnWeather[j].city === weatherInfo[i].location.city && returnWeather[j].state === weatherInfo[i].location.state){
                            returnWeather[j].maxTemp = NewMaxTemp;
                        }
                    }
                }
            }
                
        }
        res.status(200).send(returnWeather.sort(sortByMany));
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});