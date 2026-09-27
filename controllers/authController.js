const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const authController = {
  mostrarLogin(req, res) {
    if (req.session.usuario) return res.redirect('/');
    res.render('login');
  },

  async login(req, res) {
    const { usuario, password } = req.body;
    try {
      const user = await Usuario.buscarPorUsuario(usuario);
      if (!user) {
        req.flash('error', 'Usuario o contraseña incorrectos.');
        return res.redirect('/login');
      }
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        req.flash('error', 'Usuario o contraseña incorrectos.');
        return res.redirect('/login');
      }
      req.session.usuario = { id: user.id, nombre: user.nombre, rol: user.rol };
      res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al iniciar sesión.');
      res.redirect('/login');
    }
  },

  logout(req, res) {
    req.session.destroy(() => res.redirect('/login'));
  },
};

module.exports = authController;
