const pool = require('../config/db');

const Categoria = {
  async listarTodas() {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    return rows;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async crear(nombre) {
    const [result] = await pool.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
    return result.insertId;
  },

  async actualizar(id, nombre) {
    await pool.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, id]);
  },

  async eliminar(id) {
    // Los productos que la usaban quedan con categoria_id = NULL (ON DELETE SET NULL)
    await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
  },

  async contarProductos(id) {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM productos WHERE categoria_id = ? AND activo = 1',
      [id]
    );
    return total;
  },
};

module.exports = Categoria;
