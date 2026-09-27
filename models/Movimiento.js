const pool = require('../config/db');

const Movimiento = {
  async getConnection() {
    return pool.getConnection();
  },

  async ultimos(limite = 10) {
    const [rows] = await pool.query(
      `SELECT m.*, p.nombre AS producto_nombre, p.unidad, u.nombre AS usuario_nombre
       FROM movimientos m
       JOIN productos p ON p.id = m.producto_id
       LEFT JOIN usuarios u ON u.id = m.usuario_id
       ORDER BY m.fecha DESC
       LIMIT ?`,
      [limite]
    );
    return rows;
  },

  async listar({ limite = 200 } = {}) {
    const [rows] = await pool.query(
      `SELECT m.*, p.nombre AS producto_nombre, p.unidad, u.nombre AS usuario_nombre
       FROM movimientos m
       JOIN productos p ON p.id = m.producto_id
       LEFT JOIN usuarios u ON u.id = m.usuario_id
       ORDER BY m.fecha DESC
       LIMIT ?`,
      [limite]
    );
    return rows;
  },

  // Reporte por rango de fechas, con filtros opcionales de producto y tipo
  async reporte({ desde, hasta, producto_id, tipo }) {
    let sql = `
      SELECT m.*, p.nombre AS producto_nombre, p.unidad, u.nombre AS usuario_nombre
      FROM movimientos m
      JOIN productos p ON p.id = m.producto_id
      LEFT JOIN usuarios u ON u.id = m.usuario_id
      WHERE 1 = 1`;
    const params = [];
    if (desde) {
      sql += ' AND m.fecha >= ?';
      params.push(`${desde} 00:00:00`);
    }
    if (hasta) {
      sql += ' AND m.fecha <= ?';
      params.push(`${hasta} 23:59:59`);
    }
    if (producto_id) {
      sql += ' AND m.producto_id = ?';
      params.push(producto_id);
    }
    if (tipo) {
      sql += ' AND m.tipo = ?';
      params.push(tipo);
    }
    sql += ' ORDER BY m.fecha DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async crear(conn, { producto_id, usuario_id, tipo, cantidad, motivo }) {
    await conn.query(
      `INSERT INTO movimientos (producto_id, usuario_id, tipo, cantidad, motivo)
       VALUES (?, ?, ?, ?, ?)`,
      [producto_id, usuario_id, tipo, cantidad, motivo || null]
    );
  },
};

module.exports = Movimiento;
