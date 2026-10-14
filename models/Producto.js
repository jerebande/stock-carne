const pool = require('../config/db');

const Producto = {
  async listar({ q, categoria } = {}, ownerId) {
    let sql = `
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id AND c.owner_id = p.owner_id
      WHERE p.activo = 1 AND p.owner_id = ?`;
    const params = [ownerId];
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

  async listarActivosSimple(ownerId) {
    const [rows] = await pool.query(
      'SELECT * FROM productos WHERE activo = 1 AND owner_id = ? ORDER BY nombre',
      [ownerId]
    );
    return rows;
  },

  async buscarPorId(id, ownerId) {
    const [rows] = await pool.query(
      'SELECT * FROM productos WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );
    return rows[0] || null;
  },

  async buscarConBloqueo(conn, id, ownerId) {
    // FOR UPDATE dentro de una transacción, para evitar condiciones de carrera al mover stock
    const [rows] = await conn.query(
      'SELECT * FROM productos WHERE id = ? AND owner_id = ? FOR UPDATE',
      [id, ownerId]
    );
    return rows[0] || null;
  },

  async contarActivos(ownerId) {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM productos WHERE activo = 1 AND owner_id = ?',
      [ownerId]
    );
    return total;
  },

  async valorTotalStock(ownerId) {
    const [[{ valor }]] = await pool.query(
      'SELECT COALESCE(SUM(stock_actual * precio_costo), 0) AS valor FROM productos WHERE activo = 1 AND owner_id = ?',
      [ownerId]
    );
    return valor;
  },

  async conStockBajo(ownerId) {
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id AND c.owner_id = p.owner_id
      WHERE p.activo = 1 AND p.owner_id = ? AND p.stock_actual <= p.stock_minimo
      ORDER BY p.stock_actual ASC`, [ownerId]);
    return rows;
  },

  async crear(datos, ownerId) {
    const { nombre, categoria_id, unidad, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor_id } = datos;
    await this.validarRelaciones(categoria_id, proveedor_id, ownerId);
    const [result] = await pool.query(
      `INSERT INTO productos (nombre, categoria_id, unidad, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor_id, owner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, categoria_id || null, unidad, precio_costo || 0, precio_venta || 0, stock_actual || 0, stock_minimo || 0, proveedor_id || null, ownerId]
    );
    return result.insertId;
  },

  async actualizar(id, datos, ownerId) {
    const { nombre, categoria_id, unidad, precio_costo, precio_venta, stock_minimo, proveedor_id } = datos;
    await this.validarRelaciones(categoria_id, proveedor_id, ownerId);
    await pool.query(
      `UPDATE productos
       SET nombre = ?, categoria_id = ?, unidad = ?, precio_costo = ?, precio_venta = ?, stock_minimo = ?, proveedor_id = ?
       WHERE id = ? AND owner_id = ?`,
      [nombre, categoria_id || null, unidad, precio_costo || 0, precio_venta || 0, stock_minimo || 0, proveedor_id || null, id, ownerId]
    );
  },

  async actualizarStock(conn, id, nuevoStock, ownerId) {
    await conn.query(
      'UPDATE productos SET stock_actual = ? WHERE id = ? AND owner_id = ?',
      [nuevoStock, id, ownerId]
    );
  },

  async eliminar(id, ownerId) {
    // Baja lógica: se conserva el historial de movimientos
    await pool.query(
      'UPDATE productos SET activo = 0 WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );
  },

  async validarRelaciones(categoriaId, proveedorId, ownerId) {
    if (categoriaId) {
      const [rows] = await pool.query(
        'SELECT id FROM categorias WHERE id = ? AND owner_id = ?',
        [categoriaId, ownerId]
      );
      if (!rows.length) throw new Error('La categoría seleccionada no existe.');
    }
    if (proveedorId) {
      const [rows] = await pool.query(
        'SELECT id FROM proveedores WHERE id = ? AND owner_id = ?',
        [proveedorId, ownerId]
      );
      if (!rows.length) throw new Error('El proveedor seleccionado no existe.');
    }
  },
};

module.exports = Producto;
