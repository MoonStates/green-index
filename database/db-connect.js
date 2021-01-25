const mongoose = require('mongoose');
const typoModel = require('./typologie');
mongoose.set('useFindAndModify', false);

//---------------------------------------------------------------------
//Set up default mongoose connection
//---------------------------------------------------------------------
const mongoDB = 'mongodb://127.0.0.1/second_test_db';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true}).then();
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