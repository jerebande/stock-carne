const pool = require('../config/db');

const Categoria = {
  async listarTodas(ownerId) {
    const [rows] = await pool.query(
      'SELECT * FROM categorias WHERE owner_id = ? ORDER BY nombre',
      [ownerId]
    );
    return rows;
  },

  async buscarPorId(id, ownerId) {
    const [rows] = await pool.query(
      'SELECT * FROM categorias WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );
    return rows[0] || null;
  },

  async crear(nombre, ownerId) {
    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, owner_id) VALUES (?, ?)',
      [nombre, ownerId]
    );
    return result.insertId;
  },

  async actualizar(id, nombre, ownerId) {
    await pool.query(
      'UPDATE categorias SET nombre = ? WHERE id = ? AND owner_id = ?',
      [nombre, id, ownerId]
    );
  },

  async eliminar(id, ownerId) {
    // Los productos que la usaban quedan con categoria_id = NULL (ON DELETE SET NULL)
    await pool.query(
      'DELETE FROM categorias WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );
  },

  async contarProductos(id, ownerId) {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM productos WHERE categoria_id = ? AND owner_id = ? AND activo = 1',
      [id, ownerId]
    );
    return total;
  },
};

module.exports = Categoria;
