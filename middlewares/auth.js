function requireLogin(req, res, next) {
  if (!req.session.usuario) {
    req.flash('error', 'Tenés que iniciar sesión.');
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.usuario || req.session.usuario.rol !== 'admin') {
    req.flash('error', 'No tenés permisos para acceder a esa sección.');
    return res.redirect('/');
  }
  next();
}

module.exports = { requireLogin, requireAdmin };
