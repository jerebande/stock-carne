const Proveedor = require('../models/Proveedor');

const proveedoresController = {
  async listar(req, res) {
    const proveedores = await Proveedor.listarTodos();
    res.render('proveedores/lista', { proveedores });
  },

  formNuevo(req, res) {
    res.render('proveedores/form', { proveedor: null });
  },

  async crear(req, res) {
    try {
      await Proveedor.crear(req.body);
      req.flash('success', 'Proveedor creado.');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al crear el proveedor.');
    }
    res.redirect('/proveedores');
  },

  async formEditar(req, res) {
    const proveedor = await Proveedor.buscarPorId(req.params.id);
    if (!proveedor) {
      req.flash('error', 'Proveedor no encontrado.');
      return res.redirect('/proveedores');
    }
    res.render('proveedores/form', { proveedor });
  },

  async actualizar(req, res) {
    try {
      await Proveedor.actualizar(req.params.id, req.body);
      req.flash('success', 'Proveedor actualizado.');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al actualizar el proveedor.');
    }
    res.redirect('/proveedores');
  },

  async eliminar(req, res) {
    try {
      await Proveedor.eliminar(req.params.id);
      req.flash('success', 'Proveedor eliminado. Los productos que lo usaban quedaron sin proveedor.');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al eliminar el proveedor.');
    }
    res.redirect('/proveedores');
  },
};

module.exports = proveedoresController;
