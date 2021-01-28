const history = require('../database/history');
const listResult = require('../database/list_result');


// Display detail page for a specific model.
exports.website_results = async function (req, res) {
    try {

        let list_history = await find_result(req.params.webId);
        let list_participants = await find_participants();
        let list_classement = await find_classement(req.params.webId, list_history[0].ecoindex);
        let max_bande_passante = await findMaxOfBandePassante();
        let max_charge_serveur = await findMaxOfChargeServer();
        let max_complexite = await findMaxOfComplexite();

        res.render('result', {
            'max_bande_passante': max_bande_passante,
            'max_charge_serveur': max_charge_serveur,
            'max_complexite': max_complexite,
            'classement': list_classement,
            'nombre_total': list_participants,
            list_history
        });
    } catch (e) {
        res.render('error', {
            message: 'The link you are requesting does not exist.',
            button: 'Home',
            action: '/'
        });
    }
};

exports.website_results_list = async function (req, res) {
    try {

        let json_return = [];
        let json_return_false = [];
        let result = await find_list_historique(req.params.historyId);
        let id_historique_list = result[0];
        let url_false_list = result [1];

        for (const _url of url_false_list) {
            json_return_false.push({_url});
        }

        for (const _id_history of id_historique_list) {
            let list_history = await find_result(_id_history);
            let list_participants = await find_participants();
            let list_classement = await find_classement(_id_history, list_history[0].ecoindex);
            json_return.push({'classement': list_classement, 'nombre_total': list_participants, list_history});
        }
        let max_bande_passante = await findMaxOfBandePassante();
        let max_charge_serveur = await findMaxOfChargeServer();
        let max_complexite = await findMaxOfComplexite();

        res.render('resultList', {
            'max_bande_passante': max_bande_passante,
            'max_charge_serveur': max_charge_serveur,
            'max_complexite': max_complexite,
            json_return,
            json_return_false,
            'id_historique': req.params.historyId
        });
    } catch (e) {
        res.render('error', {
            message: 'The link you are requesting does not exist.',
            button: 'Home',
            action: '/'
        });
    }
}

exports.export_pdf_one = async function (req, res) {
    try {
        let list_history = await find_result(req.params.webId);
        let list_participants = await find_participants();
        let list_classement = await find_classement(req.params.webId, list_history[0].ecoindex);
        let max_bande_passante = await findMaxOfBandePassante();
        let max_charge_serveur = await findMaxOfChargeServer();
        let max_complexite = await findMaxOfComplexite();

        res.render('template_one', {
            'max_bande_passante': max_bande_passante,
            'max_charge_serveur': max_charge_serveur,
            'max_complexite': max_complexite,
            'classement': list_classement,
            'nombre_total': list_participants,
            list_history
        });
    } catch (e) {
        res.render('error', {
            message: 'The link you are requesting does not exist.',
            button: 'Home',
            action: '/'
        });
    }
}

exports.export_pdf_multiple = async function (req, res) {
    try {

        let json_return = [];
        let json_return_false = [];
        let result = await find_list_historique(req.params.historyId);
        let id_historique_list = result[0];
        let url_false_list = result [1];

        for (const _url of url_false_list) {
            json_return_false.push({_url});
        }



        for (const _id_history of id_historique_list) {
            let list_history = await find_result(_id_history);
            let list_participants = await find_participants();
            let list_classement = await find_classement(_id_history, list_history[0].ecoindex);
            json_return.push({'classement': list_classement, 'nombre_total': list_participants, list_history});
        }
        let max_bande_passante = await findMaxOfBandePassante();
        let max_charge_serveur = await findMaxOfChargeServer();
        let max_complexite = await findMaxOfComplexite();

        res.render('template_list', {
            'max_bande_passante': max_bande_passante,
            'max_charge_serveur': max_charge_serveur,
            'max_complexite': max_complexite,
            json_return,
            json_return_false,
            'id_historique': req.params.historyId
        });

    } catch (e) {
        res.render('error', {
            message: 'The link you are requesting does not exist.',
            button: 'Home',
            action: '/'
        });
    }
}

async function find_list_historique(id_history_list) {
    return new Promise(async function (resolve, reject) {
        listResult.find({'_id': id_history_list}).lean()
            .exec(function (err, resultat) {
                try {
                    if (Object.keys(resultat).length) {
                        resolve([resultat[0].object_list, resultat[0].list_url_false]);
                    }
                } catch (e) {
                    reject(new Error("ERR"));
                }
            });
    });
}

async function findMaxOfBandePassante() {
    return new Promise(async function (resolve) {
        history.find({}, {'bande_passante': 1, '_id': 0}).sort({'bande_passante': -1}).limit(1)
            .exec(function (err, max) {
                    resolve(max[0].bande_passante);
                }
            );
    });
}

async function findMaxOfComplexite() {
    return new Promise(async function (resolve) {
        history.find({}, {'complexite': 1, '_id': 0}).sort({'complexite': -1}).limit(1)
            .exec(function (err, max) {
                    resolve(max[0].complexite);
                }
            );
    });
}

async function findMaxOfChargeServer() {
    return new Promise(async function (resolve) {
        history.find({}, {'charge_serveur': 1, '_id': 0}).sort({'charge_serveur': -1}).limit(1)
            .exec(function (err, max) {
                    resolve(max[0].charge_serveur);
                }
            );
    });
}

async function find_classement(id_web, coindex_history) {
    return new Promise(async function (resolve) {
            history.aggregate([
                //{$sort: {'ecoindex': -1}},
                {$sort: {'date_analyse': -1}},
                {$group: {_id: '$ak_website', maxeco: {$first: '$ecoindex'}}},
                {$match: {maxeco: {$gte: coindex_history}}}


            ]).exec(function (err, classement) {
                if (err) {
                    console.log(err);
                }
                resolve(classement.length);
            });
        }
    )
        ;
}


async function find_participants() {
    return new Promise(async function (resolve) {
            history.find().distinct('ak_website')
                .exec(function (err, classement) {
                    if (err) {
                        console.log(err);
                    }
                    resolve(classement.length);
                });
        }
    )
        ;
}

async function find_result(id_web) {
    return new Promise(async function (resolve, reject) {
        history.find({'_id': id_web}).populate("ak_website")
            .exec(function (err, list_history_req) {
                if (err) {
                    reject(err);
                }
                resolve(list_history_req);
            })
    });
}

//return the 10 last histories for a function
exports.website_historiques = async function (req, res) {
    history.find({'ak_website': req.params.webId}).populate("ak_website")
        .sort({date_analyse: -1})
        .limit(10)
        .exec(function (err, list_historique_site) {
            if (err) {
                return new Error('ERR');
            }
            res.json(list_historique_site);
        })
}