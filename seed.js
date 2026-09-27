require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function seed() {
  const hash = await bcrypt.hash('admin123', 10);
  try {
    await pool.query(
      `INSERT INTO usuarios (nombre, usuario, password_hash, rol)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      ['Administrador', 'admin', hash, 'admin']
    );
    console.log('Usuario admin creado/actualizado: usuario="admin" password="admin123"');
  } catch (err) {
    console.error('Error creando el usuario admin:', err.message);
  } finally {
    process.exit();
  }
}

seed();
