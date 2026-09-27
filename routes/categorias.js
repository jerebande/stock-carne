const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');

router.get('/', categoriasController.listar);
router.get('/nueva', categoriasController.formNuevo);
router.post('/', categoriasController.crear);
router.get('/:id/editar', categoriasController.formEditar);
router.put('/:id', categoriasController.actualizar);
router.delete('/:id', categoriasController.eliminar);

module.exports = router;
