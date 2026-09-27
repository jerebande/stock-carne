const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireLogin } = require('../middlewares/auth');

router.get('/', requireLogin, dashboardController.mostrar);

module.exports = router;
