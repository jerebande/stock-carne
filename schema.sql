CREATE DATABASE IF NOT EXISTS carniceria_stock
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE carniceria_stock;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL,
  usuario VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'empleado') NOT NULL DEFAULT 'admin',
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_usuario (usuario)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  owner_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categorias_owner_nombre (owner_id, nombre),
  KEY idx_categorias_owner (owner_id),
  CONSTRAINT fk_categorias_owner FOREIGN KEY (owner_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proveedores (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(40) NULL,
  notas VARCHAR(500) NULL,
  owner_id INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_proveedores_owner (owner_id),
  CONSTRAINT fk_proveedores_owner FOREIGN KEY (owner_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS productos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  categoria_id INT NULL,
  unidad ENUM('kg', 'unidad') NOT NULL DEFAULT 'kg',
  precio_costo DECIMAL(12, 2) NOT NULL DEFAULT 0,
  precio_venta DECIMAL(12, 2) NOT NULL DEFAULT 0,
  stock_actual DECIMAL(12, 3) NOT NULL DEFAULT 0,
  stock_minimo DECIMAL(12, 3) NOT NULL DEFAULT 0,
  proveedor_id INT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  owner_id INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_productos_owner_activo (owner_id, activo),
  KEY idx_productos_categoria (categoria_id),
  KEY idx_productos_proveedor (proveedor_id),
  CONSTRAINT fk_productos_owner FOREIGN KEY (owner_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias (id) ON DELETE SET NULL,
  CONSTRAINT fk_productos_proveedor FOREIGN KEY (proveedor_id)
    REFERENCES proveedores (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movimientos (
  id INT NOT NULL AUTO_INCREMENT,
  producto_id INT NOT NULL,
  usuario_id INT NULL,
  owner_id INT NOT NULL,
  tipo ENUM('entrada', 'salida', 'merma', 'ajuste') NOT NULL,
  cantidad DECIMAL(12, 3) NOT NULL,
  motivo VARCHAR(500) NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_movimientos_owner_fecha (owner_id, fecha),
  KEY idx_movimientos_producto (producto_id),
  KEY idx_movimientos_usuario (usuario_id),
  CONSTRAINT fk_movimientos_owner FOREIGN KEY (owner_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_movimientos_producto FOREIGN KEY (producto_id)
    REFERENCES productos (id) ON DELETE RESTRICT,
  CONSTRAINT fk_movimientos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB;
