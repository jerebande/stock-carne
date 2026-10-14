const pool = require('../config/db');

const Proveedor = {
  async listarTodos(ownerId) {
    const [rows] = await pool.query(
      'SELECT * FROM proveedores WHERE owner_id = ? ORDER BY nombre',
      [ownerId]
    );
    return rows;
  },

  async buscarPorId(id, ownerId) {
    const [rows] = await pool.query(
      'SELECT * FROM proveedores WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );
    return rows[0] || null;
  },

  async crear({ nombre, telefono, notas }, ownerId) {
    const [result] = await pool.query(
      'INSERT INTO proveedores (nombre, telefono, notas, owner_id) VALUES (?, ?, ?, ?)',
      [nombre, telefono || null, notas || null, ownerId]
    );
    return result.insertId;
  },

  async actualizar(id, { nombre, telefono, notas }, ownerId) {
    await pool.query(
      'UPDATE proveedores SET nombre = ?, telefono = ?, notas = ? WHERE id = ? AND owner_id = ?',
      [nombre, telefono || null, notas || null, id, ownerId]
    );
  },

  async eliminar(id, ownerId) {
    await pool.query(
      'DELETE FROM proveedores WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );
  },
};

module.exports = Proveedor;
