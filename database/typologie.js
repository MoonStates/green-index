const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const typologiesSchema = new Schema({
    libelle: {type: String}

});

// Export model.
module.exports = mongoose.model('typologies', typologiesSchema);
