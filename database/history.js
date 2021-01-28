const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const historiesSchema = new Schema({
    ak_website: [{ type: Schema.ObjectId, ref: 'websites' }],
    date_analyse: {type: Date},
    ecoindex: {type: Number},
    classement_ecoindex: {type: String},
    empreinte_ges_mobile_4g: {type: Number},
    empreinte_ges_desktop_wifi: {type: Number},
    empreinte_eau: {type: Number},
    temps_chargement: {type: Number},
    complexite: {type: Number},
    charge_serveur: {type: Number},
    bande_passante: {type: Number},
    type_host: {type: Boolean},
});

// Export model.
module.exports = mongoose.model('histories', historiesSchema);
