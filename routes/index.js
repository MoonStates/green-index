const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController')

router.get('/', indexController.load_page);

router.get('/documentation', function(req, res) {
    res.render('documentation');
});
module.exports = router;
