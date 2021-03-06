const history = require('../database/history');
const webSite = require('../database/webSite');
const typologie = require('../database/typologie');
const parametre = require('../database/parametre');
const listResult = require('../database/list_result');
const zlib = require('zlib');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const fetch = require("node-fetch");
const csvtojson = require("csvtojson");


const domQuantiles = [0, 47, 75, 159, 233, 298, 358, 417, 476, 537, 603, 674, 753, 843, 949, 1076, 1237, 1459, 1801, 2479, 594601];
const reqQuantiles = [0, 2, 15, 25, 34, 42, 49, 56, 63, 70, 78, 86, 95, 105, 117, 130, 147, 170, 205, 281, 3920];
const sizeQuantiles = [0, 1.37, 144.7, 319.53, 479.46, 631.97, 783.38, 937.91, 1098.62, 1265.47, 1448.32, 1648.27, 1876.08, 2142.06, 2465.37, 2866.31, 3401.59, 4155.73, 5400.08, 8037.54, 223212.26];


// Display detail page for a specific model.
exports.website_results = async function (req, res) {
    try {
        const array_parametre = await find_parameter();
        const resultat_analyse_JSON = await resultCall(req.body.resultat_url, array_parametre[0]);
        const objectIdWeb = await getwebID(req.body.resultat_url, req.body.typo);
        const history = await insertHystory(objectIdWeb, resultat_analyse_JSON);

        //redirect for print result
        res.redirect('result/' + history);


    } catch (e) {
        console.log(e);
        res.render('error', {
            message: 'The url filled in is not correct',
            button: 'Home',
            action: '/'
        });
    }

};

exports.list_website_results = async function (req, res) {
    let json_obj = [];

    try {
        json_obj = await verifyFile(req.files.fileName.data.toString());
    } catch (e) {
        res.render('error', {
            message: 'The given file is not valid, please check the format.',
            button: 'Home',
            action: '/'
        });
    }

    const array_parametre = await find_parameter();
    let list_of_id_to_add = [];
    let list_of_url_to_add = [];


    for (const url_link of json_obj) {
        try {
            const resultat_analyse_JSON = await resultCall(url_link.lien,array_parametre[0]);
            let typo = await getTypologie(url_link.typologie);
            let id_web = await getwebID(url_link.lien, typo);
            let id_history = await insertHystory(id_web, resultat_analyse_JSON);
            list_of_id_to_add.push(id_history);
        } catch (e) {
            list_of_url_to_add.push(url_link.lien);
        }
    }

    let id_list_result = await insertListResult(list_of_id_to_add, list_of_url_to_add);
    //redirect for print result
    res.redirect('/result/list/' + id_list_result);


};

exports.analyse_async = async function (req, res) {

    let id_list_result = await create_list_result();

    let json_obj = [];

    try {
        json_obj = await verifyFile(req.files.fileName.data.toString());
    } catch (e) {
        res.render('error', {
            message: 'The given file is not valid, please check the format.',
            button: 'Back',
            action: '/admin/analyse/async'
        });
    }

    res.send('<p>Please find below the download link. Be careful, this is the only time this link will be presented to you.</p>'+
        '<p>Estimate time : '+ json_obj.length * 0.16 + ' minutes</p><br />' +
        '<a href=\'http://localhost:3000/pdf/download/' + id_list_result + '\'>http://localhost:3000/pdf/download/' + id_list_result + '<a>');

    const array_parametre = await find_parameter();
    let list_of_id_to_add = [];
    let list_of_url_to_add = [];

    for (const url_link of json_obj) {
        try {
            const resultat_analyse_JSON = await resultCall(url_link.lien, array_parametre[0]);
            let typo = await getTypologie(url_link.typologie);
            let id_web = await getwebID(url_link.lien, typo);
            let id_history = await insertHystory(id_web, resultat_analyse_JSON);
            list_of_id_to_add.push(id_history);
        } catch (e) {
            list_of_url_to_add.push(url_link.lien);
        }
    }
    await updateListResult(list_of_id_to_add, list_of_url_to_add,id_list_result);

    res.end();

}

async function verifyFile(fileAnalyse) {
    return new Promise(async function (resolve, reject) {
        csvtojson()
            .fromString(fileAnalyse)
            .then((jsonObj) => {

                if (jsonObj.length === 0) {
                    reject('err');
                }

                for (const url_link of jsonObj) {
                    if (!("lien" in url_link) || !("typologie" in url_link)) {
                        reject('err');
                    }
                }
                resolve(jsonObj);
            }).catch(err => {
            reject('err');
        });
    });
}

async function create_list_result(fileAnalyse) {
    return new Promise(async function (resolve, reject) {
        const listResult_instance = new listResult({
            object_list:[],
            list_url_false: []
        });
        listResult_instance.save(function (err) {
            if (err) return console.log(err);
            resolve(listResult_instance._id);
        })
    });
}

async function getwebID(webUrl, id_typologie) {
    return new Promise(async function (resolve) {
        await webSite.find({'url': webUrl}).lean().exec(function (err, resultat) {
            if (Object.keys(resultat).length) {
                resolve(resultat[0]._id);
            }
            //si vide
            else {
                const websites_instance = new webSite({
                    url: webUrl,
                    ak_typologie: mongoose.Types.ObjectId(id_typologie)

                });
                websites_instance.save(function (err) {
                    if (err) return console.log(err);
                    //console.log("Insertion OK !");
                })
                resolve(websites_instance._id);
            }

        });
    });
}

async function getTypologie(typologie_list) {
    return new Promise(async function (resolve) {
        typologie.find({'libelle': typologie_list}).lean().exec(function (err, resultat) {
            if (Object.keys(resultat).length) {
                resolve(resultat[0]._id);
            }
            //si vide
            else {
                const typologie_instance = new typologie({
                    libelle: typologie_list
                });
                typologie_instance.save(function (err) {
                    if (err) return console.log(err);
                    //console.log("Insertion OK !");
                })
                resolve(typologie_instance._id);
            }
        })
    });
}

async function insertHystory(objectId, resultat_analyse_JSON) {
    return new Promise(async function (resolve) {
        let now = new Date();
        let utc = new Date();
        const hystory_instance = new history({
            ak_website: mongoose.Types.ObjectId(objectId),
            date_analyse: utc,
            ecoindex: resultat_analyse_JSON.ecoindex,
            classement_ecoindex: resultat_analyse_JSON.classement_ecoindex,
            empreinte_ges_mobile_4g: resultat_analyse_JSON.empreinte_ges_mobile_4g,
            empreinte_ges_desktop_wifi: resultat_analyse_JSON.empreinte_ges_desktop_wifi,
            empreinte_eau: resultat_analyse_JSON.empreinte_eau,
            complexite: resultat_analyse_JSON.complexite,
            charge_serveur: resultat_analyse_JSON.charge_serveur,
            bande_passante: resultat_analyse_JSON.bande_passante,
            type_host: resultat_analyse_JSON.type_host,
            temps_chargement: resultat_analyse_JSON.page_load_time
        });

        hystory_instance.save(function (err) {
            if (err) return console.log(err);
            resolve(hystory_instance._id);
        })
    });
}

async function insertListResult(list_of_id_to_add, list_of_url_to_add) {
    return new Promise(async function (resolve) {
        const listResult_instance = new listResult({
            object_list: list_of_id_to_add,
            list_url_false: list_of_url_to_add
        });
        listResult_instance.save(function (err) {
            if (err) return console.log(err);
            resolve(listResult_instance._id);
        })
    });
}

async function updateListResult(list_of_id_to_add, list_of_url_to_add,id_list_result) {
    return new Promise(async function (resolve) {
        listResult.findOneAndUpdate({'_id': id_list_result}, { 'object_list': list_of_id_to_add ,'list_url_false': list_of_url_to_add}, function(err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result);
            }

    });
});
}

async function resultCall(urlWeb, parameters) {
    return new Promise(async function (resolve, reject) {
        let url = urlWeb;
        const browser = await puppeteer.launch({
            'args' : [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
        let page = await browser.newPage();

        // get number of external requests
        let req = 0;
        await page.on('request', request => {
            if (!request.url().startsWith('data:')) {
                req++;
            }
        });

        // get total uncompressed size
        let size = 0;
        await page.on('response', response => {
            if (response.ok()) {
                switch (response.headers()['content-encoding']) {
                    case 'br':
                        response.buffer().then(buffer => {
                            zlib.brotliCompress(buffer, function (_, result) {
                                size += result.length;
                            });
                        });
                        break;
                    case 'gzip':
                        response.buffer().then(buffer => {
                            zlib.gzip(buffer, function (_, result) {
                                size += result.length;
                            });
                        });
                        break;
                    case 'deflate':
                        response.buffer().then(buffer => {
                            zlib.deflate(buffer, function (_, result) {
                                size += result.length;
                            });
                        });
                        break;
                    default:
                        response.buffer().then(buffer => {
                            size += buffer.length;
                        });
                        break;
                }
            }
        });

        try {
            await page.goto(url, {waitUntil: 'networkidle2'});
        } catch (err) {
            reject(err);
        }


        // get number of DOM elements
        let dom = await page.evaluate(() => document.querySelectorAll('*').length);
        //console.log("Complexité de la page  "+dom);

        //page time load
        const gitMetrics = await page.metrics();
        let taskDuration = gitMetrics.TaskDuration;

        await browser.close();

        // calculate ecoindex
        //console.log(req);
        let index = calculate(dom, req, Math.round(size / 1024));
        //console.log(Math.round(size / 1024))
        let note = getNote(index);

        let ges_desktop = await getGes("desktop", size, parameters);
        let ges_mobile = await getGes("mobile", size, parameters);

        let electrictyByNetwork = (((size * parameters.datacenter + size * parameters.mobile_network + parameters.average_time * parameters.mobile) / parameters.consommationWaterFor1Kw) * 1000);
        let electrictyByLaptot = (((size * parameters.datacenter + size * parameters.wifi + parameters.average_time * parameters.desktop) / parameters.consommationWaterFor1Kw) * 1000);
        let water = Math.round(100 * ((electrictyByLaptot + electrictyByNetwork) / 2)) / 100;
        // let water = Math.round(100 * (3 + 3 * (50 - index) / 100)) / 100;

        //gestion pour trouver le type de host
        let url_sansHTTPS = urlWeb.replace('https://', '');
        let url_sansHTTP = url_sansHTTPS.replace('http://', '');
        let url_correct_api = url_sansHTTP.replace('www.', '');
        let api_host = 'https://api.thegreenwebfoundation.org/greencheck/'.concat(url_correct_api);
        let type_host = await find_type_host(api_host);

        let resultat_analyse = {
            ecoindex: index.toString(),
            empreinte_ges_desktop_wifi: ges_desktop,
            empreinte_ges_mobile_4g: ges_mobile,
            empreinte_eau: water,
            complexite: dom,
            charge_serveur: req,
            bande_passante: Math.round(size / 1024),
            classement_ecoindex: note,
            type_host: type_host.green,
            page_load_time: Math.round(taskDuration * 100) / 100
        }


        resolve(resultat_analyse) // successfully fill promise
    })
}


async function getGes(type, poids_page, parameters) {
    return new Promise(async function (resolve) {
        if (type === "mobile") {
            let ges = (poids_page * (parameters.datacenter + parameters.mobile_network) * parameters.world + parameters.average_time * parameters.mobile * parameters.france);
            resolve(Math.round(ges * 100) / 100)
        } else {
            let ges = (poids_page * (parameters.datacenter + parameters.wifi) * parameters.world + parameters.average_time * parameters.desktop * parameters.france);
            resolve(Math.round(ges * 100) / 100)
        }
    });
}

/**
 * @param {array} quantiles
 * @param {number} value
 * @return {number}
 */
function calculateIndex(quantiles, value) {
    for (let i = 1; i < quantiles.length; i++) {
        if (value < quantiles[i]) {
            return (i + (value - quantiles[i - 1]) / (quantiles[i] - quantiles[i - 1]));
        }
    }

    return quantiles.length;
}

/**
 * @param {number} dom Number of DOM elements
 * @param {number} req Number of HTTP requests
 * @param {number} size Page size in ko
 * @return {number}
 */
function calculate(dom, req, size) {
    let domIndex = calculateIndex(domQuantiles, dom),
        reqIndex = calculateIndex(reqQuantiles, req),
        sizeIndex = calculateIndex(sizeQuantiles, size),
        total = 100 - 5 * (3 * domIndex + 2 * reqIndex + 1 * sizeIndex) / 6;

    return parseFloat(total.toPrecision(3));
}

/**
 * @param {number} index EcoIndex
 * @return {string}
 */
function getNote(index) {
    switch (true) {
        case index >= 75:
            return 'A';
        case index >= 65:
            return 'B';
        case index >= 50:
            return 'C';
        case index >= 35:
            return 'D';
        case index >= 20:
            return 'E';
        case index >= 5:
            return 'F';
        default:
            return 'G';
    }
}

async function find_type_host(api_host) {
    return new Promise(async function (resolve) {
        fetch(api_host)
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    return Promise.reject(res.status);
                }
            })
            .then(res => resolve(res))
            .catch(err => resolve(false));
    })
}

async function find_parameter() {
    return new Promise(async function (resolve) {
        parametre.find({})
            .exec(function (err, list_parametre) {
                if (err) {
                    return reject(err);
                }
                resolve(list_parametre);
            })
    })
}
