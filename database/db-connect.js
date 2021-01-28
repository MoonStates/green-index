const mongoose = require('mongoose');
const typoModel = require('./typologie');
const paraModel = require('./parametre');
mongoose.set('useFindAndModify', false);
require('dotenv').config()
//---------------------------------------------------------------------
//Set up default mongoose connection
//---------------------------------------------------------------------
const uri = "mongodb+srv://dbUser:<password>@cluster0.lhcse.mongodb.net/<dbname>?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}).then();
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


//Insertion des libelles
const array = [
    { libelle: 'E-Commerce' },
    { libelle: 'Portail' },
    { libelle: 'Blog' },
    { libelle: 'Site vitrine' }
];

array.forEach(function(n) {

    typoModel.findOneAndUpdate( n, n, { upsert: true }, function(err,doc) {
        //console.log( doc );
    });

});



//insertion des paramètres
const array_param = [
    {
        average_time: 2.31667 ,
        wifi: 0.000000000152,
        mobile_network: 0.000000000884,
        desktop: 0.00032,
        mobile: 0.00011 ,
        datacenter: 0.000000000072,
        france: 59.9,
        world: 600.8,
        consommationWaterFor1Kw: 4
    }

];

array_param.forEach(function(n) {

    paraModel.findOneAndUpdate( n, n, { upsert: true }, function(err,doc) {
        //console.log( doc );
    });

});
