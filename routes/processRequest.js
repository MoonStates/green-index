// wiki.js - Wiki route module.

const express = require('express');
const router = express.Router();
const processRequestController = require('../controllers/processRequestController')

// Home page route.
router.post('/', processRequestController.website_results);

router.post('/file', processRequestController.list_website_results);

router.post('/Analyse/Async', processRequestController.analyse_async);

module.exports = router;