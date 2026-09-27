const Movimiento = require('../models/Movimiento');
const Producto = require('../models/Producto');

const reportesController = {
  async mostrar(req, res) {
    const { desde, hasta, producto_id, tipo } = req.query;
    const productos = await Producto.listarActivosSimple();

    let movimientos = [];
    let totales = { entradas: 0, salidas: 0, mermas: 0, ajustes: 0 };

    if (desde || hasta || producto_id || tipo) {
      movimientos = await Movimiento.reporte({ desde, hasta, producto_id, tipo });
      movimientos.forEach(m => {
        const cant = Number(m.cantidad);
        if (m.tipo === 'entrada') totales.entradas += cant;
        else if (m.tipo === 'salida') totales.salidas += cant;
        else if (m.tipo === 'merma') totales.mermas += cant;
        else if (m.tipo === 'ajuste') totales.ajustes += 1;
      });
    }

    res.render('reportes/index', {
      movimientos, totales, productos,
      filtros: { desde: desde || '', hasta: hasta || '', producto_id: producto_id || '', tipo: tipo || '' },
      buscado: Boolean(desde || hasta || producto_id || tipo),
    });
  },
};

module.exports = reportesController;
