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

const rubrosNegocio = {
  carniceria: {
    nombre: 'Carnicería', icono: '🥩', etiqueta: 'Productos', resumen: 'stock', tema: 'carniceria',
    unidades: [['kg', 'Kilogramos (kg)'], ['unidad', 'Unidad'], ['caja', 'Caja']],
  },
  kiosco: {
    nombre: 'Kiosco', icono: '🛒', etiqueta: 'Artículos', resumen: 'inventario', tema: 'kiosco',
    unidades: [['unidad', 'Unidad'], ['litro', 'Litros'], ['ml', 'Mililitros (ml)'], ['pack', 'Pack'], ['caja', 'Caja'], ['kg', 'Kilogramos (kg)']],
  },
  mercado: {
    nombre: 'Mercado', icono: '🥬', etiqueta: 'Productos', resumen: 'stock', tema: 'mercado',
    unidades: [['kg', 'Kilogramos (kg)'], ['litro', 'Litros'], ['unidad', 'Unidad'], ['cajon', 'Cajón'], ['caja', 'Caja']],
  },
  farmacia: {
    nombre: 'Farmacia', icono: '💊', etiqueta: 'Medicamentos', resumen: 'stock farmacéutico', tema: 'farmacia',
    unidades: [['unidad', 'Unidad'], ['caja', 'Caja'], ['blister', 'Blíster'], ['frasco', 'Frasco'], ['ml', 'Mililitros (ml)']],
  },
  ecommerce: {
    nombre: 'E-commerce', icono: '🛍️', etiqueta: 'Productos', resumen: 'stock digital', tema: 'ecommerce',
    unidades: [['unidad', 'Unidad'], ['pack', 'Pack'], ['caja', 'Caja']],
  },
  logistica: {
    nombre: 'Logística y distribución', icono: '🚚', etiqueta: 'Productos', resumen: 'inventario logístico', tema: 'logistica',
    unidades: [['unidad', 'Unidad'], ['caja', 'Caja'], ['pallet', 'Pallet'], ['kg', 'Kilogramos (kg)'], ['litro', 'Litros']],
  },
  industria: {
    nombre: 'Industria y manufactura', icono: '🏭', etiqueta: 'Insumos', resumen: 'stock de producción', tema: 'industria',
    unidades: [['unidad', 'Unidad'], ['kg', 'Kilogramos (kg)'], ['litro', 'Litros'], ['metro', 'Metros'], ['rollo', 'Rollo'], ['caja', 'Caja']],
  },
  supermercado: {
    nombre: 'Supermercado / almacén', icono: '🏪', etiqueta: 'Artículos', resumen: 'existencias', tema: 'supermercado',
    unidades: [['unidad', 'Unidad'], ['litro', 'Litros'], ['ml', 'Mililitros (ml)'], ['kg', 'Kilogramos (kg)'], ['pack', 'Pack'], ['caja', 'Caja']],
  },
  moda: {
    nombre: 'Ropa y accesorios', icono: '👕', etiqueta: 'Artículos', resumen: 'inventario de tienda', tema: 'moda',
    unidades: [['unidad', 'Unidad'], ['par', 'Par'], ['docena', 'Docena'], ['caja', 'Caja']],
  },
  salud: {
    nombre: 'Salud y laboratorio', icono: '🧪', etiqueta: 'Insumos', resumen: 'inventario médico', tema: 'salud',
    unidades: [['unidad', 'Unidad'], ['caja', 'Caja'], ['frasco', 'Frasco'], ['ml', 'Mililitros (ml)'], ['litro', 'Litros']],
  },
};

const obtenerRubro = (negocio) => rubrosNegocio[negocio] || rubrosNegocio.carniceria;

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
  const negocioSeleccionado = req.session.negocio || 'carniceria';
  res.locals.usuario = req.session.usuario || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.path = req.path;
  res.locals.negocio = negocioSeleccionado;
  res.locals.negocioConfig = obtenerRubro(negocioSeleccionado);
  res.locals.unidadesNegocio = obtenerRubro(negocioSeleccionado).unidades;
  res.locals.opcionesNegocio = rubrosNegocio;
  next();
});

app.post('/configuracion/rubro', requireLogin, (req, res) => {
  const negocio = req.body.negocio;

  if (!rubrosNegocio[negocio]) {
    req.flash('error', 'El rubro seleccionado no es válido.');
    return res.redirect(req.get('Referrer') || '/');
  }

  req.session.negocio = negocio;
  req.flash('success', `Rubro actualizado a ${rubrosNegocio[negocio].nombre}.`);
  res.redirect(req.get('Referrer') || '/');
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
