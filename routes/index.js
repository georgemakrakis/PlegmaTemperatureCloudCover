var express = require('express');
var router = express.Router();
let request = require('request');
let apiKey = 'ec5c652e69d4fe0b77e132a53fe2970a';
let network = require('network');
let mongoose = require('mongoose');

let siteLocationsModel = require('../models/siteLocationMongoModel');

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
           //todo make the weather API call for all sites using their long, lat
            sites.forEach(function (site)
            {
               //console.log(site.location.lat+'.....'+site.location.long);
                getWeatherData(site.location.lat, site.location.long, d.getUTCHours());
                // let WD = Promise.all([
                //
                // ]).then((data) => {
                //
                //     let WeatherData = new Selector({
                //         date: myDate,
                //         weatherData: data
                //     });
                //     WeatherData.save(function (err, res) {
                //         if (err)
                //         {
                //             return console.error(err);
                //         }
                //         if (res)
                //         {
                //             console.log(res);
                //         }
                //     });
                // });
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
