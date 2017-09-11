var express = require('express');
var router = express.Router();
let request = require('request');
let apiKey = 'ec5c652e69d4fe0b77e132a53fe2970a';
let network = require('network');
let mongoose = require('mongoose');

let siteLocationsModel = require('../models/siteLocationMongoModel');

function weatherDataOps()
{
    siteLocationsModel.find({},{location:1}, function (err, sites) {
        if (err)
        {
            return console.error(err);
        }
        else
        {
           //todo make the weather API call for all sites using their long, lat
        }
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
