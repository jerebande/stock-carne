const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');

const movimientosController = {
  async listar(req, res) {
    const movimientos = await Movimiento.listar({ limite: 200 });
    res.render('movimientos/lista', { movimientos });
  },

  async formNuevo(req, res) {
    const productos = await Producto.listarActivosSimple();
    res.render('movimientos/form', { productos });
  },

  async crear(req, res) {
    const { producto_id, tipo, cantidad, motivo } = req.body;
    const cant = parseFloat(cantidad);

    if (!producto_id || !tipo || isNaN(cant) || cant <= 0) {
      req.flash('error', 'Datos inválidos para el movimiento.');
      return res.redirect('/movimientos/nuevo');
    }

    const conn = await Movimiento.getConnection();
    try {
      await conn.beginTransaction();

      const producto = await Producto.buscarConBloqueo(conn, producto_id);
      if (!producto) throw new Error('Producto no encontrado');

      let nuevoStock;
      if (tipo === 'entrada') {
        nuevoStock = parseFloat(producto.stock_actual) + cant;
      } else if (tipo === 'salida' || tipo === 'merma') {
        nuevoStock = parseFloat(producto.stock_actual) - cant;
        if (nuevoStock < 0) {
          await conn.rollback();
          conn.release();
          req.flash('error', `No hay suficiente stock de "${producto.nombre}" (disponible: ${producto.stock_actual} ${producto.unidad}).`);
          return res.redirect('/movimientos/nuevo');
        }
      } else if (tipo === 'ajuste') {
        nuevoStock = cant; // el ajuste fija el stock al valor indicado
      } else {
        throw new Error('Tipo de movimiento inválido');
      }

      await Producto.actualizarStock(conn, producto_id, nuevoStock);
      await Movimiento.crear(conn, {
        producto_id,
        usuario_id: req.session.usuario.id,
        tipo,
        cantidad: cant,
        motivo,
      });

      await conn.commit();
      req.flash('success', 'Movimiento registrado correctamente.');
      res.redirect('/movimientos');
    } catch (err) {
      console.error(err);
      await conn.rollback();
      req.flash('error', 'Error al registrar el movimiento.');
      res.redirect('/movimientos/nuevo');
    } finally {
      conn.release();
    }
  },
};

module.exports = movimientosController;
