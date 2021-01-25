const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const listResultSchema = new Schema({
    object_list: {type: []},
    list_url_false: {type: []}
});

// Export model.
module.exports = mongoose.model('listResults', listResultSchema);