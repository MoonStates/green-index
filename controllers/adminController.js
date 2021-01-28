const typologie = require('../database/typologie');
const parametre = require('../database/parametre');


// Display detail page for a specific model.
exports.load_page = async function (req, res) {
    const list_typologie = await selectTypologie();
    const list_param = await selectParam();
    res.render('admin', {list_typologie, list_param});
};

exports.change_param = async function (req, res) {
    try {
        console.log(req.body.strValue)
        if(req.body.strValue !==""){
            console.log("test")
            await update_parametre(req.body.strType,req.body.strValue);
            res.redirect('/admin');
        }
         else {
              throw new Error("null");
        }


    } catch (e) {

        res.render('error', {
            message: 'This field only accepts numeric values.',
            button: 'Back',
            action: '/admin'
        });
    }

};

exports.new_typologie = async function (req, res) {
    if (req.body.libelleNewTypo !=="") {
        await insert_typo(req.body.libelleNewTypo);
        res.redirect('/admin');
    }
    if (req.body.libelleNewTypo ===""){
        res.render('error', {
            message: 'Incorrect typing, please try again.',
            button: 'Back',
            action: '/admin'
        });
    }
};

exports.delete_typo = async function (req, res) {
    await drop_typo(req.body.libelleDeleteTypo)
    res.redirect('/admin');
};
exports.reset = async function(req, res) {
    await parametre.deleteMany({});
    await insert_parametre();
    res.redirect('/admin');
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

async function selectParam() {
    return new Promise(async function (resolve, reject) {
        let tmparray = [];
        parametre.find()
            .exec(function (err, list_param) {
                if (err) {
                    return reject(err);
                }
                list_param.forEach(function (element) {
                    tmparray.push(element);
                })
                resolve(tmparray);
            })
    });
}

async function update_parametre(type,value) {
    return new Promise(async function (resolve, reject) {
        switch (type) {
            case 'average_time':
                parametre.findOneAndUpdate({}, { 'average_time': value }, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result);
                    }
                });
                break;
            case 'wifi':
                parametre.findOneAndUpdate({}, { 'wifi': value }, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result);
                    }
                });
                break;
            case 'mobile_network':
                parametre.findOneAndUpdate({}, { 'mobile_network': value }, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result);
                    }
                });
                break;
            case 'desktop':
                parametre.findOneAndUpdate({}, { 'desktop': value }, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result);
                    }
                });
                break;
            case 'mobile':
                parametre.findOneAndUpdate({}, { 'mobile': value }, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result);
                    }
                });
                break;
            case 'datacenter':
                parametre.findOneAndUpdate({}, { 'datacenter': value }, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result);
                    }
                });
                break;
            case 'france':
                parametre.findOneAndUpdate({}, { 'france': value }, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result);
                    }
                });
                break;
            case 'world':
                parametre.findOneAndUpdate({}, { 'world': value }, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result);
                    }
                });
                break;
            case 'consommationWaterFor1Kw':
                parametre.findOneAndUpdate({}, { 'consommationWaterFor1Kw': value }, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result);
                    }
                });
                break;


            default:
                reject("err")
        }


    });
}

async function insert_typo(lib) {
    return new Promise(async function (resolve, reject) {

        typologie.findOneAndUpdate({'libelle': lib}, { 'libelle': lib },{ upsert: true}, function(err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result);
            }
        });
    });
}

async function drop_typo(lib) {
    return new Promise(async function (resolve, reject) {
        typologie.deleteOne({ '_id': lib}, function (err,result) {
            if (err) {
                reject(err)
            } else {
                resolve(result);
            }
        });
    });
}

async function insert_parametre() {
    return new Promise(async function (resolve, reject) {
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
            parametre.findOneAndUpdate( n, n, { upsert: true }, function(err,doc) {
                resolve(doc);
            });
        });

    });
}