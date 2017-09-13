var express = require('express');
var router = express.Router();
let request = require('request');
let apiKey = 'ec5c652e69d4fe0b77e132a53fe2970a';
let network = require('network');
let mongoose = require('mongoose');

let siteLocationsModel = require('../models/siteLocationMongoModel');
let weatherDataModel = mongoose.Schema({
    date: String,
    weatherData: Object
});

function weatherDataOps()
{
    var d = new Date();
    let myDate = d.getDate() + ' ' + d.getMonth() + ' ' + d.getFullYear();

    siteLocationsModel.find({},{location:1}, function (err, sites) {
        if (err)
        {
            return console.error(err);
        }
        else
        {
            sites.forEach(function (site)
            {
                //console.log(site.location.lat+'.....'+site.location.long);
                let Selector = mongoose.model('id_' + site._id + 'weatherdata', weatherDataModel);
                try
                {
                    Selector.findOne().where('date').equals(myDate).exec(function (err, result)
                    {
                        if (err)
                        {
                            return console.error(err);
                        }
                        else if (result === null)
                        {
                            //first we are calling the function to get weather data
                            // and waiting for the promise for the other funciton to proceed
                            //to data insertion link: https://blog.risingstack.com/node-hero-async-programming-in-node-js/
                            let WD = Promise.all([
                                getWeatherData(site.location.lat,site.location.long, d.getUTCHours())
                            ]).then((data) => {

                                    let WeatherData = new Selector({
                                        date: myDate,
                                        weatherData: data
                                    });
                                    WeatherData.save(function (err, res) {
                                        if (err)
                                        {
                                            return console.error(err);
                                        }
                                        if (res)
                                        {
                                            console.log(res);
                                        }
                                    });
                                    //sendData(WeatherData.weatherData,client)
                                }
                            );



                        }
                        else
                        {
                            console.log('DATA EXIST No2---->SEND DATA TO USER');
                            //console.log(result.weatherData);
                            //sendData(WeatherData.weatherData,client)
                        }
                    });
                }
                catch (e)
                {
                    let WeatherData = new Selector({
                        date: myDate,
                        weatherData: getWeatherData(site.location.lat,site.location.long, d.getUTCHours())
                    });
                    WeatherData.save(function (err, res) {
                        if (err)
                        {
                            return console.error(err);
                        }
                        if (res)
                        {
                            console.log(res);
                        }
                    });
                    //sendData(WeatherData.weatherData,client)
                }
            });
        }
    });
}
function getWeatherData(lat,long, time)
{
    return new Promise((resolve, reject)=>{

        let requestUrl = 'http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID=' + apiKey + '&lat=' + lat + '&lon=' + long + '&units=metric';

        request(requestUrl, function (error, response, body) {
            if (error) {
                return reject (error)
            }
            if (!error && response.statusCode == 200)
            {
                //console.log(response);
                console.log('============');
                // parse the json result
                let result = JSON.parse(body);
                console.log(result);
                //This function will return the data to the user
                //sendData(result,client,time);
                resolve(result)
            }
            else
            {
                //client.emit('replyData', {weatherData:body});
                reject(error)
            }

        });

    });

}

/* GET home page. */
router.get('/', function(req, res, next)
{
    // let a = Promise.all([
    //
    // ]).then((data) => {
    //     console.log(data)
    // });
    weatherDataOps();
    res.render('index', { title: 'Express' });
});

module.exports = router;
