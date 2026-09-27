const Categoria = require('../models/Categoria');

const categoriasController = {
  async listar(req, res) {
    const categorias = await Categoria.listarTodas();
    // cantidad de productos por categoría, para mostrar y para avisar antes de borrar
    const conteos = await Promise.all(categorias.map(c => Categoria.contarProductos(c.id)));
    const categoriasConConteo = categorias.map((c, i) => ({ ...c, total_productos: conteos[i] }));
    res.render('categorias/lista', { categorias: categoriasConConteo });
  },

  formNuevo(req, res) {
    res.render('categorias/form', { categoria: null });
  },

  async crear(req, res) {
    const { nombre } = req.body;
    try {
      await Categoria.crear(nombre);
      req.flash('success', 'Categoría creada.');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Ya existe una categoría con ese nombre o hubo un error.');
    }
    res.redirect('/categorias');
  },

  async formEditar(req, res) {
    const categoria = await Categoria.buscarPorId(req.params.id);
    if (!categoria) {
      req.flash('error', 'Categoría no encontrada.');
      return res.redirect('/categorias');
    }
    res.render('categorias/form', { categoria });
  },

  async actualizar(req, res) {
    try {
      await Categoria.actualizar(req.params.id, req.body.nombre);
      req.flash('success', 'Categoría actualizada.');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al actualizar la categoría.');
    }
    res.redirect('/categorias');
  },

  async eliminar(req, res) {
    try {
      await Categoria.eliminar(req.params.id);
      req.flash('success', 'Categoría eliminada. Los productos que la usaban quedaron sin categoría.');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al eliminar la categoría.');
    }
    res.redirect('/categorias');
  },
};

module.exports = categoriasController;
