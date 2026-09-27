# Control de Stock - Carnicería

App web para gestionar el stock de una carnicería: productos, categorías, proveedores, movimientos (entradas/salidas/mermas/ajustes), reportes y alertas de stock bajo.

**Stack:** Node.js + Express + EJS + MySQL + sesiones (mysql2, bcryptjs, express-session).

## Estructura del proyecto (MVC)

```
config/db.js          → conexión (pool) a MySQL
models/                → acceso a datos, una clase por tabla principal
  Usuario.js
  Categoria.js
  Proveedor.js
  Producto.js
  Movimiento.js
controllers/           → lógica de cada sección, usa los models
  authController.js
  dashboardController.js
  productosController.js
  movimientosController.js
  categoriasController.js
  proveedoresController.js
  reportesController.js
routes/                → solo define las URLs y qué controller responde a cada una
middlewares/auth.js    → requireLogin / requireAdmin
views/                 → plantillas EJS, organizadas por sección
public/css/style.css
server.js              → arma la app Express y conecta todo
schema.sql             → estructura de la base de datos
seed.js                → crea el usuario admin inicial
```

## Instalación

1. Instalar dependencias:
   ```
   npm install
   ```

2. Crear la base de datos (con MySQL corriendo):
   ```
   mysql -u root -p < schema.sql
   ```

3. Copiar `.env.example` a `.env` y completar tus credenciales de MySQL:
   ```
   cp .env.example .env
   ```

4. Crear el usuario administrador inicial:
   ```
   npm run seed
   ```
   Esto crea el usuario `admin` con contraseña `admin123` y rol `admin`.

5. Levantar el servidor:
   ```
   npm start
   ```
   o en modo desarrollo (reinicio automático):
   ```
   npm run dev
   ```

6. Abrir `http://localhost:3000` e iniciar sesión.

## Funcionalidad incluida

- **Login con sesiones** (usuario/contraseña con hash bcrypt).
- **Panel principal**: total de productos, productos con stock bajo, valor total del stock a costo, últimos movimientos.
- **Productos**: alta, edición, baja (baja lógica), filtro por nombre y categoría, stock mínimo configurable por producto.
- **Movimientos de stock**: entrada (compra/reposición), salida (venta), merma (pérdida/descarte) y ajuste (fijar el stock a un valor exacto). Se actualiza el stock automáticamente y queda un historial completo, todo dentro de una transacción con bloqueo de fila para evitar condiciones de carrera.
- **Categorías y proveedores**: CRUD completo desde la interfaz (antes había que cargarlos por SQL).
- **Reportes**: filtro de movimientos por rango de fechas, producto y tipo, con totales de entradas/salidas/mermas/ajustes.
- **Roles diferenciados**: `admin` y `empleado`.
  - Cualquier usuario logueado puede: ver el panel, cargar/editar productos, registrar movimientos, ver reportes.
  - Solo `admin` puede: eliminar productos, y gestionar categorías y proveedores (crear/editar/eliminar). Los enlaces a Categorías y Proveedores solo se muestran a los admins en la barra de navegación.
- **Alertas de stock bajo**: cualquier producto cuyo stock actual sea menor o igual a su mínimo se marca en rojo en el panel y en el listado.

### Cómo crear un usuario "empleado"

Todavía no hay pantalla de gestión de usuarios. Se puede insertar directo en la tabla `usuarios` con un hash de bcrypt, por ejemplo desde `node`:
```js
const bcrypt = require('bcryptjs');
bcrypt.hash('la_contraseña', 10).then(console.log);
```
y después:
```sql
INSERT INTO usuarios (nombre, usuario, password_hash, rol)
VALUES ('Nombre del empleado', 'usuario_login', '<hash generado>', 'empleado');
```

## Ideas para ampliar más adelante

- Pantalla de gestión de usuarios (alta/edición desde la interfaz, sin tocar SQL).
- Exportar reportes a Excel/PDF.
- Registro de ventas con clientes y no solo movimientos de stock.
