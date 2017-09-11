let mongoose = require('mongoose');
let Schema = require ('mongoose').Schema;

let siteLocations = new Schema(
    {
        location: {
            lat: String,
            long: String
        },
        locationName: String,
        description: String,
        Meters: [String],
        userid: [String]
        //(PV):
    }
);
module.exports = mongoose.model('siteLocations', siteLocations);