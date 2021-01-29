const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')
const path = require('path');
const mongoose = require('mongoose');
const listResult = require('../database/list_result');
const zip = require('express-zip');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const history = require('../database/history')

async function resultToCSV(idTable) {
    return new Promise(async function (resolve, reject) {
        let return_data = [];

        let array_of_id = await getListOfHistoryID(idTable);

        for (const _id_history of array_of_id) {
            let list_history = await find_result(_id_history);
            return_data.push(list_history)
        }

        console.log(return_data);
        resolve(return_data);
    });
}

async function find_result(id_web) {
    return new Promise(async function (resolve, reject) {
        history.findOne({'_id': id_web}).populate("ak_website")
            .exec(function (err, list_history_req) {
                if (err) {
                    reject(err);
                }

                let p = {
                        url: list_history_req.ak_website[0].url,
                        NR_score: list_history_req.ecoindex,
                        GHG_4G_Footprint: list_history_req.empreinte_ges_mobile_4g,
                        GHG_WiFi_Footprint: list_history_req.empreinte_ges_desktop_wifi,
                        Water_Footprint: list_history_req.empreinte_eau,
                        Complexity: list_history_req.complexite,
                        load_average: list_history_req.charge_serveur,
                        Pass_band: list_history_req.bande_passante
                    }
                ;
                resolve(p);
            })

    });
}

async function getListOfHistoryID(idTable) {
    return new Promise(async function (resolve, reject) {
        listResult.find({'_id': idTable}, {'object_list': 1, '_id': 0})
            .exec(function (err, resultat) {
                if (err) {
                    reject(new Error("ERR"));
                }
                resolve(resultat[0].object_list);
            });
    });
}

async function pdf(url, req) {
    const filename = `public/temp/scoreNR-${req.params.webid}.pdf`;
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto(process.env.URI_WEB + 'result/template/' + url, {waitUntil: 'networkidle2'});
    await page.pdf({
        path: filename,
        height: 1920 / 0.75,
        width: 1080 / 0.75,
        scale: 1 / 0.75,
        landscape: true,
        printBackground: true
    });

    await browser.close();
    return filename;
}

async function pdf_list(url, req) {
    const filename = `public/temp/scoreNR-${req.params.idTable}.pdf`;
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto(process.env.URI_WEB + 'result/template/list/' + url, {waitUntil: 'networkidle2'});
    await page.pdf({
        path: filename,
        height: 1920 / 0.75,
        width: 1080 / 0.75,
        scale: 1 / 0.75,
        landscape: true,
        printBackground: true
    });

    await browser.close();
    return filename;
}

///Print PDF route
router.get("/:webid", async function (req, res) {
    var url = req.params.webid;
    const filename = await pdf(url, req);

    res.contentType("application/pdf");
    res.download(path.join(process.cwd(), filename));

});

router.get('/list/:idTable', async function (req, res) {
    var url = req.params.idTable;
    const filename = await pdf_list(url, req);

    res.contentType("application/pdf");
    res.download(path.join(process.cwd(), filename));
});

router.get('/download/:idTable', async function (req, res) {
    try {
        let a = await verifyResult(req.params.idTable);
        let result_list = await resultToCSV(req.params.idTable);

        const csvWriter = createCsvWriter({
            path: `public/temp/scoreNR-${req.params.idTable}.csv`,
            header: [
                {id: 'url', title: 'url'},
                {id: 'NR_score', title: 'NR_score'},
                {id: 'GHG_4G_Footprint', title: 'GHG_4G_Footprint'},
                {id: 'GHG_WiFi_Footprint', title: 'GHG_WiFi_Footprint'},
                {id: 'Water_Footprint', title: 'Water_Footprint'},
                {id: 'Complexity', title: 'Complexity'},
                {id: 'load_average', title: 'load_average'},
                {id: 'Pass_band', title: 'Pass_band'}
            ]
        });

        await csvWriter.writeRecords(result_list);

        const url = req.params.idTable;
        const filename = await pdf_list(url, req);
        res.zip([{
            path: path.join(process.cwd(), filename),
            name: 'result-scoreNR.pdf'
        }, {
            path: path.join(process.cwd(), `public/temp/scoreNR-${req.params.idTable}.csv`),
            name: 'result-scoreNR.csv'
        }], "Analyse-" + new Date().getMonth() + 1 + "-" + new Date().getDate() + "-" + new Date().getFullYear() + ".zip");
    } catch (e) {
        if (e === "404") {
            res.render('error', {
                message: 'The page you are looking for does not exist',
                button: 'Home',
                action: '/'
            });
        } else {
            res.render('error', {
                message: 'The analysis is not finished yet, please come back later...',
                button: 'Refresh',
                action: '/pdf/download/' + req.params.idTable
            });
        }
    }
});

async function verifyResult(idTable) {
    return new Promise(async function (resolve, reject) {
        listResult.find({'_id': idTable}).exec(function (err, resultat) {
            if (resultat === undefined) {
                reject('404');
            } else if (resultat[0].object_list.length === 0) {
                reject('200');
            } else {
                resolve(resultat[0]._id);
            }
        });
    })
}


module.exports = router