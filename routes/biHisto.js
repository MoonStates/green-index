const express = require('express');
const router = express.Router();
const biHistoController = require('../controllers/biHistoController')

// uniquement un render
router.get('/', biHistoController.load_page);

// Sans option
router.get('/all/distinct/:boolDist', biHistoController.bi_all);

// Typologie uniquement
router.get('/typo/:idTypo/distinct/:boolDist', biHistoController.bi_typo);

// Uniquement sur la date
router.get('/dateStart/:idDateStart/dateEnd/:idDateEnd/distinct/:boolDist', biHistoController.bi_date);

// typo + date
router.get('/typo/:idTypo/dateStart/:idDateStart/dateEnd/:idDateEnd/distinct/:boolDist', biHistoController.bi_typo_date);

router.get('/chart/typo/:idTypo/dateStart/:idDateStart/dateEnd/:idDateEnd', biHistoController.bi_typo_date_chart);


module.exports = router;