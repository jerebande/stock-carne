const pool = require('../config/db');

const Asistente = {
  async resumenStock(ownerId) {
    const [[resumen]] = await pool.query(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(stock_actual <= stock_minimo), 0) AS bajo_minimo,
              COALESCE(SUM(stock_actual * precio_costo), 0) AS valor
       FROM productos
       WHERE owner_id = ? AND activo = 1`,
      [ownerId]
    );
    return resumen;
  },

  async listarBajoStock(ownerId, limite = 8) {
    const [rows] = await pool.query(
      `SELECT nombre, stock_actual, stock_minimo, unidad
       FROM productos
       WHERE owner_id = ? AND activo = 1 AND stock_actual <= stock_minimo
       ORDER BY (stock_minimo - stock_actual) DESC, nombre
       LIMIT ?`,
      [ownerId, limite]
    );
    return rows;
  },

  async productosParaContexto(ownerId, limite = 100) {
    const [rows] = await pool.query(
      `SELECT nombre, stock_actual, stock_minimo, unidad, precio_costo, precio_venta
       FROM productos
       WHERE owner_id = ? AND activo = 1
       ORDER BY nombre
       LIMIT ?`,
      [ownerId, limite]
    );
    return rows;
  },

  async resumenMovimientos(ownerId, periodo) {
    let filtroFecha = 'm.fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    if (periodo === 'hoy') filtroFecha = 'm.fecha >= CURDATE()';
    if (periodo === 'ayer') filtroFecha = 'm.fecha >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND m.fecha < CURDATE()';
    if (periodo === 'mes') filtroFecha = 'm.fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)';

    const [rows] = await pool.query(
      `SELECT m.tipo, COUNT(*) AS operaciones, COALESCE(SUM(m.cantidad), 0) AS cantidad
       FROM movimientos m
       JOIN productos p ON p.id = m.producto_id
       WHERE m.owner_id = ? AND p.owner_id = ? AND ${filtroFecha}
       GROUP BY m.tipo
       ORDER BY FIELD(m.tipo, 'entrada', 'salida', 'merma', 'ajuste')`,
      [ownerId, ownerId]
    );
    return rows;
  },

  async ultimosMovimientos(ownerId, limite = 5) {
    const [rows] = await pool.query(
      `SELECT m.tipo, m.cantidad, m.fecha, p.nombre AS producto, p.unidad
       FROM movimientos m
       JOIN productos p ON p.id = m.producto_id
       WHERE m.owner_id = ? AND p.owner_id = ?
       ORDER BY m.fecha DESC
       LIMIT ?`,
      [ownerId, ownerId, limite]
    );
    return rows;
  },
};

module.exports = Asistente;
