const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const parametresSchema = new Schema({
    average_time: {type: Number},
    wifi: {type: Number},
    mobile_network: {type: Number},
    desktop: {type: Number},
    mobile: {type: Number},
    datacenter: {type: Number},
    france: {type: Number},
    world: {type: Number},
    consommationWaterFor1Kw: {type: Number}
});

// Export model.
module.exports = mongoose.model('parametres', parametresSchema);