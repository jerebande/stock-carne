const pool = require('../config/db');

const Proveedor = {
  async listarTodos() {
    const [rows] = await pool.query('SELECT * FROM proveedores ORDER BY nombre');
    return rows;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query('SELECT * FROM proveedores WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async crear({ nombre, telefono, notas }) {
    const [result] = await pool.query(
      'INSERT INTO proveedores (nombre, telefono, notas) VALUES (?, ?, ?)',
      [nombre, telefono || null, notas || null]
    );
    return result.insertId;
  },

  async actualizar(id, { nombre, telefono, notas }) {
    await pool.query(
      'UPDATE proveedores SET nombre = ?, telefono = ?, notas = ? WHERE id = ?',
      [nombre, telefono || null, notas || null, id]
    );
  },

  async eliminar(id) {
    await pool.query('DELETE FROM proveedores WHERE id = ?', [id]);
  },
};

module.exports = Proveedor;
