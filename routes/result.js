// wiki.js - Wiki route module.

const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController')

router.get('/', function(req, res) {
    res.render('result', { title: 'Test Application' });
});

router.get('/:webId', resultController.website_results);

router.get('/historique/:webId', resultController.website_historiques)

router.get('/list/:historyId', resultController.website_results_list)

module.exports = router;