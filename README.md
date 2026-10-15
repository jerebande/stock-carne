# Control de Stock - Carnicería

Aplicación web para gestionar productos, categorías, proveedores, movimientos de stock, reportes y alertas para varias cuentas independientes.

**Stack:** Node.js + Express + EJS + MySQL + sesiones (mysql2, bcryptjs, express-session).

## Instalación

1. Instalar dependencias:
   ```sh
   npm install
   ```

2. Crear las tablas en MySQL:
   ```sh
   mysql -u root -p < schema.sql
   ```

3. Configurar `.env` con las credenciales de MySQL y reemplazar `SESSION_SECRET` por un valor aleatorio largo antes de exponer la aplicación. En producción es obligatorio configurar un secreto estable.
   Si la aplicación está detrás de un proxy HTTPS del hosting, Express confía en el proxy inmediato para poder emitir correctamente las cookies de sesión seguras.

4. (Opcional) Crear la cuenta de demostración `admin` con contraseña inicial `admin123`:
   ```sh
   npm run seed
   ```
   Cambiá esa contraseña antes de usar la instancia de forma pública.

5. Iniciar la aplicación:
   ```sh
   npm start
   ```
   o en desarrollo:
   ```sh
   npm run dev
   ```

6. Abrir `http://localhost:3000` y crear una cuenta desde **Crear cuenta**.

### Actualizar una instalación existente

Antes de desplegar esta versión, hacé una copia de seguridad de la base de datos y creá o conservá el usuario `admin` existente. Luego ejecutá una sola vez la migración, seleccionando la base configurada en `DB_NAME`:

```sh
mysql -u root -p carniceria_stock < migrations/001_multi_tenant.sql
```

La migración asigna las categorías, proveedores, productos y movimientos anteriores a `admin`. Sustituí `carniceria_stock` si tu base tiene otro nombre. No ejecutes esta migración sobre una base recién creada con `schema.sql`, ya que esa ya incluye las columnas de propietario.

## Configurar el asistente de IA

1. Creá una API key desde [Groq Console](https://console.groq.com/keys).
2. Configurá `GROQ_API_KEY` en las variables de entorno de Windows (Configuración avanzada del sistema → Variables de entorno). Podés configurar opcionalmente `GROQ_MODEL`; el modelo predeterminado es `openai/gpt-oss-120b`.
3. Cerrá y volvé a abrir la terminal para que tome la variable y reiniciá el servidor. Si la clave falta, la pantalla del asistente indicará que necesita configuración; la clave nunca se envía al navegador.

No pegues la clave en el chat ni la subas a Git. En este repositorio `.env` ya está versionado; no guardes la API key allí. `.gitignore` evita que se agreguen nuevos archivos `.env`, pero no deja de versionar automáticamente el archivo que ya está en Git.

El asistente solo consulta información de inventario de la cuenta autenticada. La generación es de solo lectura y no actualiza productos ni movimientos.

## Cuentas y privacidad de datos

- Cualquier persona puede crear una cuenta con nombre, usuario y contraseña. Las contraseñas se guardan con hash bcrypt.
- Cada cuenta nueva tiene permisos de administración **solo sobre sus propios datos**.
- Los productos, categorías, proveedores, movimientos, alertas y reportes se filtran por la cuenta autenticada; tampoco es posible asignar productos a categorías o proveedores de otra cuenta.
- El nombre de usuario es único en toda la aplicación.
- Cada cuenta puede iniciar y cerrar sesión desde cualquier dispositivo.

## Funcionalidades

- **Panel principal:** total de productos, alertas de stock bajo, valor del stock y últimos movimientos.
- **Productos:** alta, edición, baja lógica, búsqueda y stock mínimo configurable.
- **Movimientos:** entradas, salidas, mermas y ajustes, con actualización transaccional del stock.
- **Categorías y proveedores:** gestión privada por cuenta.
- **Reportes:** filtros por fechas, producto y tipo de movimiento.
- **Asistente con Groq:** mantiene los últimos turnos de la conversación durante la sesión de la página y responde en lenguaje natural usando hasta 100 productos activos, alertas de stock bajo y 30 movimientos recientes de la cuenta autenticada. Si hay más de 100 productos activos, informa que el contexto está limitado. Las consultas y esos datos se envían a la API de Groq para generar la respuesta.
- **Diseño adaptable:** navegación, formularios, indicadores y tablas utilizables en móviles y escritorio.
