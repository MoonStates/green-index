const typologie = require('../database/typologie');
const history = require('../database/history');
const mongoose = require('mongoose');

// Display detail page for a specific model.
exports.load_page = async function (req, res) {
    const list_typologie = await selectTypologie();
    res.render('historique', {list_typologie});
};


async function selectTypologie() {
    return new Promise(async function (resolve, reject) {
        let tmparray = [];
        typologie.find({}, {libelle: 1, _id: 1})
            .exec(function (err, list_typologie) {
                if (err) {
                    return reject(err);
                }
                list_typologie.forEach(function (element) {
                    tmparray.push(element);
                })
                resolve(tmparray);
            })
    });
}

// Display detail page for a specific model.
exports.bi_typo = async function (req, res) {
    try {
        const return_json = await find_typo(req.params.boolDist, req.params.idTypo);
        res.json({return_json});
    } catch (e) {
        res.json({'error': 'the request was not successful'});
    }
};

exports.bi_date = async function (req, res) {
    try {
        const return_json = await find_date(req.params.boolDist, req.params.idDateStart, req.params.idDateEnd);
        res.json({return_json});
    } catch (e) {
        res.json({'error': 'the request was not successful'});
    }
};

exports.bi_typo_date = async function (req, res) {
    try {
        const return_json = await find_typo_date(req.params.boolDist, req.params.idDateStart, req.params.idDateEnd,req.params.idTypo);
        res.json({return_json});
    } catch (e) {
        res.json({'error': 'the request was not successful'});
    }
};

exports.bi_all = async function (req, res) {
    try {
        const return_json = await find_all(req.params.boolDist);
        res.json({return_json});
    } catch (e) {
        res.json({'error': 'the request was not successful'});
    }
}

exports.bi_typo_date_chart = async function (req, res) {
    try {
        const return_chart_json = await find_moyenne_all(req.params.idDateStart, req.params.idDateEnd,req.params.idTypo);
        res.json({return_chart_json});
    } catch (e) {
        res.json({'error': 'the request was not successful'});
    }
};

async function find_typo(boolDist, idTypo) {
    return new Promise(async function (resolve, reject) {
        try {
            if (boolDist === "false") {
                history.aggregate(
                    [
                        {
                            "$lookup": {
                                "from": "websites",
                                "localField": "ak_website",
                                "foreignField": "_id",
                                "as": "websites"
                            }
                        },
                        {"$unwind": "$websites"},
                        {"$match": {"websites.ak_typologie": mongoose.Types.ObjectId(idTypo)}}
                    ]).exec(function (err, resultat) {
                    resolve(resultat);
                });

            } else {
                history.aggregate(
                    [
                        {
                            "$lookup": {
                                "from": "websites",
                                "localField": "ak_website",
                                "foreignField": "_id",
                                "as": "websites"
                            }
                        },
                        {"$unwind": "$websites"},
                        {"$match": {"websites.ak_typologie": mongoose.Types.ObjectId(idTypo)}},
                        {"$sort": {"date_analyse": -1}},
                        {
                            "$group":
                                {
                                    _id: {ak_website: "$ak_website"},
                                    url: {$first: "$websites.url"},
                                    date_analyse: {$first: "$date_analyse"},
                                    ecoindex: {$first: "$ecoindex"},
                                    complexite: {$first: "$complexite"},
                                    empreinte_ges_mobile_4g: {$first: "$empreinte_ges_mobile_4g"},
                                    empreinte_ges_deskop_wifi: {$first: "$empreinte_ges_desktop_wifi"},
                                    empreinte_eau: {$first: "$empreinte_eau"}
                                }
                        }

                    ]).exec(function (err, resultat) {
                    resolve(resultat);
                });
            }
        } catch (e) {
            reject('THE REQUEST DOENST WORK');
        }
    });
}

async function find_date(boolDist, idDateStart, idDateEnd) {
    return new Promise(async function (resolve, reject) {
        let vardateStart;
        let vardateEnd;
        if (idDateStart !== "null") {
            vardateStart = new Date(idDateStart);
        } else{
            vardateStart = new Date("1899-12-31T00:00:00.000Z");
        }
        if (idDateEnd !== "null") {
            vardateEnd = new Date(idDateEnd);
        } else {
            vardateEnd = new Date("3000-12-31T00:00:00.000Z");
        }

        try {
            if (boolDist === "false") {
                history.aggregate(
                    [
                        {
                            "$lookup": {
                                "from": "websites",
                                "localField": "ak_website",
                                "foreignField": "_id",
                                "as": "websites"
                            }
                        },
                        {"$unwind": "$websites"},
                        {"$match": {"date_analyse": {$gte: vardateStart, $lte: vardateEnd}}}
                    ]).exec(function (err, resultat) {
                    resolve(resultat);
                });

            } else {
                history.aggregate(
                    [
                        {
                            "$lookup": {
                                "from": "websites",
                                "localField": "ak_website",
                                "foreignField": "_id",
                                "as": "websites"
                            }
                        },
                        {"$unwind": "$websites"},

                        {"$match": {"date_analyse": {$gte: vardateStart, $lte: vardateEnd}}},
                        {"$sort": {"date_analyse": -1}},
                        {
                            "$group":
                                {
                                    _id: {ak_website: "$ak_website"},
                                    url: {$first: "$websites.url"},
                                    date_analyse: {$first: "$date_analyse"},
                                    ecoindex: {$first: "$ecoindex"},
                                    complexite: {$first: "$complexite"},
                                    empreinte_ges_mobile_4g: {$first: "$empreinte_ges_mobile_4g"},
                                    empreinte_ges_deskop_wifi: {$first: "$empreinte_ges_desktop_wifi"},
                                    empreinte_eau: {$first: "$empreinte_eau"}
                                }
                        },

                    ]).exec(function (err, resultat) {
                    resolve(resultat);
                });
            }
        } catch (e) {
            reject('THE REQUEST DOENST WORK');
        }
    });
}

async function find_all(boolDist) {
    return new Promise(async function (resolve, reject) {
        try {
            if (boolDist === "false") {
                history.find({}).populate('ak_website')
                    .exec(function (err, resultat) {
                        resolve(resultat);
                    });
            } else {
                history.aggregate(
                    [
                        {
                            "$lookup": {
                                "from": "websites",
                                "localField": "ak_website",
                                "foreignField": "_id",
                                "as": "websites"
                            }
                        },
                        {"$unwind": "$websites"},
                        {"$sort": {"date_analyse": -1}},
                        {
                            "$group":
                                {
                                    _id: {ak_website: "$ak_website"},
                                    url: {$first: "$websites.url"},
                                    date_analyse: {$first: "$date_analyse"},
                                    ecoindex: {$first: "$ecoindex"},
                                    complexite: {$first: "$complexite"},
                                    empreinte_ges_mobile_4g: {$first: "$empreinte_ges_mobile_4g"},
                                    empreinte_ges_deskop_wifi: {$first: "$empreinte_ges_desktop_wifi"},
                                    empreinte_eau: {$first: "$empreinte_eau"}
                                }
                        },
                    ]).exec(function (err, resultat) {
                    resolve(resultat);
                });
            }

        } catch (e) {
            reject('THE REQUEST DOENST WORK');
        }
    });
}

async function find_typo_date(boolDist, idDateStart, idDateEnd, idTypo) {
    return new Promise(async function (resolve, reject) {
        let vardateStart;
        let vardateEnd;
        if (idDateStart !== "null") {
            vardateStart = new Date(idDateStart);
        } else{
            vardateStart = new Date("1899-12-31T00:00:00.000Z");
        }
        if (idDateEnd !== "null") {
            vardateEnd = new Date(idDateEnd);
        } else {
            vardateEnd = new Date("3000-12-31T00:00:00.000Z");
        }

        try {
            if (boolDist === "false") {
                history.aggregate(
                    [
                        {
                            "$lookup": {
                                "from": "websites",
                                "localField": "ak_website",
                                "foreignField": "_id",
                                "as": "websites"
                            }
                        },
                        {"$unwind": "$websites"},
                        {"$match": { $and: [{"date_analyse": {$gte: vardateStart, $lte: vardateEnd}},{"websites.ak_typologie": mongoose.Types.ObjectId(idTypo)}]}}
                    ]).exec(function (err, resultat) {
                    resolve(resultat);
                });

            } else {
                history.aggregate(
                    [
                        {
                            "$lookup": {
                                "from": "websites",
                                "localField": "ak_website",
                                "foreignField": "_id",
                                "as": "websites"
                            }
                        },
                        {"$unwind": "$websites"},

                        {"$match": { $and: [{"date_analyse": {$gte: vardateStart, $lte: vardateEnd}},{"websites.ak_typologie": mongoose.Types.ObjectId(idTypo)}]}},
                        {"$sort": {"date_analyse": -1}},
                        {
                            "$group":
                                {
                                    _id: {ak_website: "$ak_website"},
                                    url: {$first: "$websites.url"},
                                    date_analyse: {$first: "$date_analyse"},
                                    ecoindex: {$first: "$ecoindex"},
                                    complexite: {$first: "$complexite"},
                                    empreinte_ges_mobile_4g: {$first: "$empreinte_ges_mobile_4g"},
                                    empreinte_ges_deskop_wifi: {$first: "$empreinte_ges_desktop_wifi"},
                                    empreinte_eau: {$first: "$empreinte_eau"}
                                }
                        },

                    ]).exec(function (err, resultat) {
                    resolve(resultat);
                });
            }
        } catch (e) {
            reject('THE REQUEST DOENST WORK');
        }
    });
}

async function find_moyenne_all(idDateStart, idDateEnd, idTypo) {
    return new Promise(async function (resolve, reject) {
        let vardateStart;
        let vardateEnd;
        if (idDateStart !== "null") {
            vardateStart = new Date(idDateStart);
        } else{
            vardateStart = new Date("1899-12-31T00:00:00.000Z");
        }
        if (idDateEnd !== "null") {
            vardateEnd = new Date(idDateEnd);
        } else {
            vardateEnd = new Date("3000-12-31T00:00:00.000Z");
        }
        try {
            if(idTypo!=="null"){
                history.aggregate(
                    [
                        {
                            "$lookup": {
                                "from": "websites",
                                "localField": "ak_website",
                                "foreignField": "_id",
                                "as": "websites"
                            }
                        },
                        {"$unwind": "$websites"},
                        {"$match": { $and: [{"date_analyse": {$gte: vardateStart, $lte: vardateEnd}},{"websites.ak_typologie": mongoose.Types.ObjectId(idTypo)}]}},
                        {"$sort": {"date_analyse": -1}},
                        { "$group":
                                { _id: {ak_website :"$ak_website"},
                                    firstEcoIndex: { $first: "$ecoindex" },
                                    firstEmpreinte_ges_mobile_4g: { $first: "$empreinte_ges_mobile_4g" },
                                    firstEmpreinte_ges_deskop_wifi: { $first: "$empreinte_ges_desktop_wifi" },
                                    firstEmpreinte_eau: { $first: "$empreinte_eau" },
                                    firstComplexite: { $first: "$complexite" },
                                    firstChargeServeur: { $first: "$charge_serveur" },
                                    firstBandePassante: { $first: "$bande_passante" },
                                    firstTempsChargement: { $first: "$temps_chargement" }

                                }
                        },
                        { "$group":
                                { _id: "_id",
                                    avgEcoIndexTotal: { $avg: "$firstEcoIndex" },
                                    avgEmpreinte_ges_mobile_4gTotal: { $avg: "$firstEmpreinte_ges_mobile_4g" },
                                    avgEmpreinte_ges_deskop_wifiTotal: { $avg: "$firstEmpreinte_ges_deskop_wifi" },
                                    avgEmpreinte_eauTotal: { $avg: "$firstEmpreinte_eau" },
                                    avgComplexiteTotal: { $avg: "$firstComplexite" },
                                    avgChargeServeurTotal: { $avg: "$firstChargeServeur" },
                                    avgBandePassanteTotal: { $avg: "$firstBandePassante" },
                                    avgTempsChargementTotal: { $avg: "$firstTempsChargement" }

                                }
                        }
                    ]).exec(function (err, resultat) {
                    resolve(resultat);
                });
            }
            else {
                history.aggregate(
                    [
                        {
                            "$lookup": {
                                "from": "websites",
                                "localField": "ak_website",
                                "foreignField": "_id",
                                "as": "websites"
                            }
                        },
                        {"$unwind": "$websites"},
                        {"$match": {"date_analyse": {$gte: vardateStart, $lte: vardateEnd}}},
                        {"$sort": {"date_analyse": -1}},
                        { "$group":
                                { _id: {ak_website :"$ak_website"},
                                    firstEcoIndex: { $first: "$ecoindex" },
                                    firstEmpreinte_ges_mobile_4g: { $first: "$empreinte_ges_mobile_4g" },
                                    firstEmpreinte_ges_deskop_wifi: { $first: "$empreinte_ges_desktop_wifi" },
                                    firstEmpreinte_eau: { $first: "$empreinte_eau" },
                                    firstComplexite: { $first: "$complexite" },
                                    firstChargeServeur: { $first: "$charge_serveur" },
                                    firstBandePassante: { $first: "$bande_passante" },
                                    firstTempsChargement: { $first: "$temps_chargement" }
                                }
                        },
                        { "$group":
                                { _id: "_id",
                                    avgEcoIndexTotal: { $avg: "$firstEcoIndex" },
                                    avgEmpreinte_ges_mobile_4gTotal: { $avg: "$firstEmpreinte_ges_mobile_4g" },
                                    avgEmpreinte_ges_deskop_wifiTotal: { $avg: "$firstEmpreinte_ges_deskop_wifi" },
                                    avgEmpreinte_eauTotal: { $avg: "$firstEmpreinte_eau" },
                                    avgComplexiteTotal: { $avg: "$firstComplexite" },
                                    avgChargeServeurTotal: { $avg: "$firstChargeServeur" },
                                    avgBandePassanteTotal: { $avg: "$firstBandePassante" },
                                    avgTempsChargementTotal: { $avg: "$firstTempsChargement" }

                                }
                        }
                    ]).exec(function (err, resultat) {
                    resolve(resultat);
                });
            }

            }
         catch (e) {
            reject('THE REQUEST DOENST WORK');
        }
    });
}
