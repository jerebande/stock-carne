const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientosController');

router.get('/', movimientosController.listar);
router.get('/nuevo', movimientosController.formNuevo);
router.post('/', movimientosController.crear);

module.exports = router;
