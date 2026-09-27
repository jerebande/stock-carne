const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const { requireAdmin } = require('../middlewares/auth');

router.get('/', productosController.listar);
router.get('/nuevo', productosController.formNuevo);
router.post('/', productosController.crear);
router.get('/:id/editar', productosController.formEditar);
router.put('/:id', productosController.actualizar);
// Solo el admin puede eliminar productos (empleados pueden crear/editar)
router.delete('/:id', requireAdmin, productosController.eliminar);

module.exports = router;
