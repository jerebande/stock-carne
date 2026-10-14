const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');

const dashboardController = {
  async mostrar(req, res, next) {
    try {
      const [total_productos, bajoStock, ultimosMovimientos, valor_stock] = await Promise.all([
        Producto.contarActivos(req.session.usuario.id),
        Producto.conStockBajo(req.session.usuario.id),
        Movimiento.ultimos(req.session.usuario.id, 10),
        Producto.valorTotalStock(req.session.usuario.id),
      ]);

      res.render('dashboard', { total_productos, bajoStock, ultimosMovimientos, valor_stock });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
};

module.exports = dashboardController;
