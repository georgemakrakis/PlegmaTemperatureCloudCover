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

function resolveAfter61Seconds() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
            console.log('Timeout for >60 sites-API calls happened');
        }, 61000);
    });
}
function weatherDataOps()
{
    //todo this date must come from client
    var d = new Date();
    let myDate = d.getDate() + ' ' + (d.getMonth()+1) + ' ' + d.getFullYear();

    siteLocationsModel.find({},{location:1}, function (err, sites) {
        if (err)
        {
            return console.error(err);
        }
        else
        {
            sites.forEach(async function (site,index)
            {
                //this is the check for >60 sites-API calls that the API allows
                if((index % 60)==0 && index!=0)
                {
                    const a= await resolveAfter61Seconds();
                }
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
                                    let dt = Promise.all([
                                        temperatureAndCloud(Selector, site.location.lat, site.location.long, d, myDate)
                                    ]).then((data) => {});

                                }
                            );



                        }
                        else
                        {
                            console.log('DATA EXIST No2---->SEND DATA TO USER for: '+site.location);
                            //console.log(result.weatherData);
                            //sendData(WeatherData.weatherData,client)
                            let dt = Promise.all([
                                temperatureAndCloud(Selector, site.location.lat, site.location.long, d, myDate)
                            ]).then((data) => {});
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
                    let dt = Promise.all([
                        temperatureAndCloud(Selector, site.location.lat, site.location.long, d, myDate)
                    ]).then((data) => {});
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

function temperatureAndCloud(Selector,lat,long,date,myDate)
{
    let hour=date.getHours();
    //2017-09-15 21:00:00
    let dateFormat = date.getFullYear()+'-0'+(date.getMonth()+1)+'-'+date.getDate()
    //let dateFormat = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+hour+':'+'00'+':'+'00';
    try
    {
        Selector.findOne().where('date').equals(myDate).exec(function (err, result) {
            if (err)
            {
                return console.error(err);
            }
            else if (result)
            {
                result.weatherData[0].list.forEach(function (item,index)
                {
                    if(item.dt_txt.substring(0,10)===dateFormat)
                    {
                        let dataHour=item.dt_txt.substring(11,13);
                        let dataHour2=(result.weatherData[0].list[index+1]).dt_txt.substring(11,13);
                        if(hour>=21)
                        {
                            console.log('Cloud cover:'+item.clouds.all+'%');
                            console.log('Temperature:'+item.main.temp+' Celsius');
                        }
                        else if(hour>=dataHour && hour<=dataHour2)
                        {
                            console.log('Cloud cover:'+item.clouds.all+'%');
                            console.log('Temperature:'+item.main.temp+' Celsius');
                        }
                    }

                });
                //substring(11,13);
            }
        });
    }
    catch(e)
    {
        return console.error(e);
    }
    return;
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
