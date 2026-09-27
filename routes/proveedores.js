const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');

router.get('/', proveedoresController.listar);
router.get('/nuevo', proveedoresController.formNuevo);
router.post('/', proveedoresController.crear);
router.get('/:id/editar', proveedoresController.formEditar);
router.put('/:id', proveedoresController.actualizar);
router.delete('/:id', proveedoresController.eliminar);

module.exports = router;
