const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const Proveedor = require('../models/Proveedor');

const productosController = {
  async listar(req, res) {
    const { q, categoria } = req.query;
    const [productos, categorias] = await Promise.all([
      Producto.listar({ q, categoria }, req.session.usuario.id),
      Categoria.listarTodas(req.session.usuario.id),
    ]);
    res.render('productos/lista', { productos, categorias, q, categoria });
  },

  async formNuevo(req, res) {
    const [categorias, proveedores] = await Promise.all([
      Categoria.listarTodas(req.session.usuario.id),
      Proveedor.listarTodos(req.session.usuario.id),
    ]);
    res.render('productos/form', { producto: null, categorias, proveedores });
  },

  async crear(req, res) {
    try {
      await Producto.crear(req.body, req.session.usuario.id);
      req.flash('success', 'Producto creado correctamente.');
      res.redirect('/productos');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al crear el producto.');
      res.redirect('/productos/nuevo');
    }
  },

  async formEditar(req, res) {
    const producto = await Producto.buscarPorId(req.params.id, req.session.usuario.id);
    if (!producto) {
      req.flash('error', 'Producto no encontrado.');
      return res.redirect('/productos');
    }
    const [categorias, proveedores] = await Promise.all([
      Categoria.listarTodas(req.session.usuario.id),
      Proveedor.listarTodos(req.session.usuario.id),
    ]);
    res.render('productos/form', { producto, categorias, proveedores });
  },

  async actualizar(req, res) {
    try {
      await Producto.actualizar(req.params.id, req.body, req.session.usuario.id);
      req.flash('success', 'Producto actualizado.');
      res.redirect('/productos');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al actualizar el producto.');
      res.redirect(`/productos/${req.params.id}/editar`);
    }
  },

  async eliminar(req, res) {
    try {
      await Producto.eliminar(req.params.id, req.session.usuario.id);
      req.flash('success', 'Producto eliminado.');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al eliminar el producto.');
    }
    res.redirect('/productos');
  },
};

module.exports = productosController;
