const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

function iniciarSesion(req, res, user, destino = '/') {
  req.session.regenerate(err => {
    if (err) {
      console.error(err);
      return res.redirect('/login');
    }
    req.session.usuario = { id: user.id, nombre: user.nombre, rol: user.rol };
    res.redirect(destino);
  });
}

const authController = {
  mostrarLogin(req, res) {
    if (req.session.usuario) return res.redirect('/');
    res.render('login');
  },

  mostrarRegistro(req, res) {
    if (req.session.usuario) return res.redirect('/');
    res.render('registro');
  },

  async registro(req, res) {
    const nombre = typeof req.body.nombre === 'string' ? req.body.nombre.trim() : '';
    const usuario = typeof req.body.usuario === 'string' ? req.body.usuario.trim().toLowerCase() : '';
    const { password, confirmar_password } = req.body;

    if (nombre.length < 2 || nombre.length > 80) {
      req.flash('error', 'El nombre debe tener entre 2 y 80 caracteres.');
      return res.redirect('/registro');
    }
    if (!/^[a-z0-9_.-]{3,30}$/.test(usuario)) {
      req.flash('error', 'El usuario debe tener entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo.');
      return res.redirect('/registro');
    }
    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 72 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      req.flash('error', 'La contraseña debe tener entre 8 y 72 caracteres.');
      return res.redirect('/registro');
    }
    if (password !== confirmar_password) {
      req.flash('error', 'Las contraseñas no coinciden.');
      return res.redirect('/registro');
    }

    try {
      const existente = await Usuario.buscarPorUsuario(usuario);
      if (existente) {
        req.flash('error', 'Ese nombre de usuario ya está en uso.');
        return res.redirect('/registro');
      }
      const password_hash = await bcrypt.hash(password, 12);
      const id = await Usuario.crear({ nombre, usuario, password_hash, rol: 'admin' });
      return iniciarSesion(req, res, { id, nombre, rol: 'admin' });
    } catch (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        req.flash('error', 'Ese nombre de usuario ya está en uso.');
      } else {
        req.flash('error', 'No se pudo crear la cuenta. Intentá nuevamente.');
      }
      return res.redirect('/registro');
    }
  },

  async login(req, res) {
    const usuario = typeof req.body.usuario === 'string' ? req.body.usuario.trim().toLowerCase() : '';
    const password = req.body.password;
    try {
      const user = await Usuario.buscarPorUsuario(usuario);
      if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.password_hash))) {
        req.flash('error', 'Usuario o contraseña incorrectos.');
        return res.redirect('/login');
      }
      return iniciarSesion(req, res, user);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al iniciar sesión.');
      res.redirect('/login');
    }
  },

  logout(req, res) {
    req.session.destroy(err => {
      if (err) {
        console.error(err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  },
};

module.exports = authController;
