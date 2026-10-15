require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const crypto = require('crypto');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productosRoutes = require('./routes/productos');
const movimientosRoutes = require('./routes/movimientos');
const categoriasRoutes = require('./routes/categorias');
const proveedoresRoutes = require('./routes/proveedores');
const reportesRoutes = require('./routes/reportes');
const asistenteRoutes = require('./routes/asistente');
const { requireLogin, requireAdmin } = require('./middlewares/auth');

const app = express();
const sessionSecret = process.env.SESSION_SECRET || (
  process.env.NODE_ENV === 'production' ? null : crypto.randomBytes(32).toString('hex')
);

if (!sessionSecret) {
  throw new Error('Definí SESSION_SECRET en el entorno antes de iniciar en producción.');
}

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}));
app.use(flash());

// Variables disponibles en todas las vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.path = req.path;
  next();
});

app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/productos', requireLogin, productosRoutes);
app.use('/movimientos', requireLogin, movimientosRoutes);
app.use('/reportes', requireLogin, reportesRoutes);
app.use('/asistente', requireLogin, asistenteRoutes);
// Categorías y proveedores: solo el admin puede gestionarlos
app.use('/categorias', requireLogin, requireAdmin, categoriasRoutes);
app.use('/proveedores', requireLogin, requireAdmin, proveedoresRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
