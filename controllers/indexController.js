const typologie = require('../database/typologie');
const history = require('../database/history');


// Display detail page for a specific model.
exports.load_page = async function (req, res) {

    const list_typologie = await selectTypologie();
    const list_top_url = await selectTop10();
    res.render('index', {list_typologie, list_top_url});
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

async function selectTop10() {
    return new Promise(async function (resolve, reject) {
        let tmparray = [];
        history.aggregate([
            {
                $lookup: {
                    from: "websites",
                    localField: "ak_website",
                    foreignField: "_id",
                    as: "website"
                }
            },
            {$unwind: "$website"},
            {$sort: {"date_analyse": -1, "_id": -1}},
            {
                $group: {
                    _id: "$ak_website",
                    ecoindex: {"$first": "$ecoindex"},
                    empreinte_ges_desktop_wifi: {"$first": "$empreinte_ges_desktop_wifi"},
                    empreinte_ges_mobile_4g: {"$first": "$empreinte_ges_mobile_4g"},
                    empreinte_eau: {"$first": "$empreinte_eau"},
                    url: {"$first": "$website"},
                }
            },
            {$sort: {"ecoindex": -1}},
            {$limit: 10}

        ]).exec(function (err, list_history) {
            if (err) {
                return reject(err);
            }
            list_history.forEach(function (element) {
                tmparray.push(JSON.stringify({"ecoindex": element.ecoindex, "url" : element.url.url , "empreinte_ges_desktop_wifi" : element.empreinte_ges_desktop_wifi , 'empreinte_ges_mobile_4g': element.empreinte_ges_mobile_4g, "empreinte_eau" : element.empreinte_eau}));
            });
            resolve(tmparray);
        })
    });
}




