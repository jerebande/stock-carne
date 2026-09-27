const pool = require('../config/db');

const Usuario = {
  async buscarPorUsuario(usuario) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    return rows[0] || null;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query('SELECT id, nombre, usuario, rol FROM usuarios WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async crear({ nombre, usuario, password_hash, rol }) {
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, usuario, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, usuario, password_hash, rol]
    );
    return result.insertId;
  },
};

module.exports = Usuario;
