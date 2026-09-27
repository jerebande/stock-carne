const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');

const dashboardController = {
  async mostrar(req, res) {
    try {
      const [total_productos, bajoStock, ultimosMovimientos, valor_stock] = await Promise.all([
        Producto.contarActivos(),
        Producto.conStockBajo(),
        Movimiento.ultimos(10),
        Producto.valorTotalStock(),
      ]);

      res.render('dashboard', { total_productos, bajoStock, ultimosMovimientos, valor_stock });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al cargar el panel.');
      res.render('dashboard', { total_productos: 0, bajoStock: [], ultimosMovimientos: [], valor_stock: 0 });
    }
  },
};

module.exports = dashboardController;
