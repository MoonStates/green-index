const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const websitesSchema = new Schema({
    url: {type: String},
    ak_typologie: [{ type: Schema.ObjectId, ref: 'typologies' }]
});


// Export model.
module.exports = mongoose.model('websites', websitesSchema);

