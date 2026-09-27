const pool = require('../config/db');

const Producto = {
  async listar({ q, categoria } = {}) {
    let sql = `
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE p.activo = 1`;
    const params = [];
    if (q) {
      sql += ' AND p.nombre LIKE ?';
      params.push(`%${q}%`);
    }
    if (categoria) {
      sql += ' AND p.categoria_id = ?';
      params.push(categoria);
    }
    sql += ' ORDER BY p.nombre ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async listarActivosSimple() {
    const [rows] = await pool.query('SELECT * FROM productos WHERE activo = 1 ORDER BY nombre');
    return rows;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async buscarConBloqueo(conn, id) {
    // FOR UPDATE dentro de una transacción, para evitar condiciones de carrera al mover stock
    const [rows] = await conn.query('SELECT * FROM productos WHERE id = ? FOR UPDATE', [id]);
    return rows[0] || null;
  },

  async contarActivos() {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM productos WHERE activo = 1');
    return total;
  },

  async valorTotalStock() {
    const [[{ valor }]] = await pool.query(
      'SELECT COALESCE(SUM(stock_actual * precio_costo), 0) AS valor FROM productos WHERE activo = 1'
    );
    return valor;
  },

  async conStockBajo() {
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE p.activo = 1 AND p.stock_actual <= p.stock_minimo
      ORDER BY p.stock_actual ASC`);
    return rows;
  },

  async crear(datos) {
    const { nombre, categoria_id, unidad, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor_id } = datos;
    const [result] = await pool.query(
      `INSERT INTO productos (nombre, categoria_id, unidad, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, categoria_id || null, unidad, precio_costo || 0, precio_venta || 0, stock_actual || 0, stock_minimo || 0, proveedor_id || null]
    );
    return result.insertId;
  },

  async actualizar(id, datos) {
    const { nombre, categoria_id, unidad, precio_costo, precio_venta, stock_minimo, proveedor_id } = datos;
    await pool.query(
      `UPDATE productos
       SET nombre = ?, categoria_id = ?, unidad = ?, precio_costo = ?, precio_venta = ?, stock_minimo = ?, proveedor_id = ?
       WHERE id = ?`,
      [nombre, categoria_id || null, unidad, precio_costo || 0, precio_venta || 0, stock_minimo || 0, proveedor_id || null, id]
    );
  },

  async actualizarStock(conn, id, nuevoStock) {
    await conn.query('UPDATE productos SET stock_actual = ? WHERE id = ?', [nuevoStock, id]);
  },

  async eliminar(id) {
    // Baja lógica: se conserva el historial de movimientos
    await pool.query('UPDATE productos SET activo = 0 WHERE id = ?', [id]);
  },
};

module.exports = Producto;
