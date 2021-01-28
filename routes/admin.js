const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')

router.get('/', adminController.load_page);

// Typologie uniquement
router.post('/type/value', adminController.change_param);

//insert new typo
router.post('/newTypo', adminController.new_typologie);

//delete new typo
router.post('/deleteTypo', adminController.delete_typo);

//reset all
router.get('/reset', adminController.reset);

router.get('/analyse/async', function(req, res) {
    res.render('analyseAscyn');
});

module.exports = router;
