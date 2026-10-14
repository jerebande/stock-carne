const express = require('express');
const router = express.Router();
const asistenteController = require('../controllers/asistenteController');

router.get('/', asistenteController.mostrar);
router.post('/consultar', asistenteController.consultar);

module.exports = router;
