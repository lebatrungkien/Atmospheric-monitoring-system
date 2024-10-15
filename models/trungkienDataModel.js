const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataSchema = new Schema({
    temp: Number,
    humi: Number,
    aqi: Number,
    co2: Number,
    wind: Number,
    pm25: Number,
    pm10: Number,
    pm1: Number,
    createdAt: Date,
    metadata: {
        height: Number,
        location: String,
        deviceID: String,
    }
}, {
    timeseries: {
        timeField: 'createdAt',
        granularity: 'hours',
        metaField: 'metadata'
    }
});

module.exports = mongoose.model('trungkien2k6', dataSchema);