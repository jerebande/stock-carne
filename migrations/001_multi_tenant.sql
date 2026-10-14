-- Run once on an existing installation after ensuring usuarios contains the
-- legacy admin account. Existing records are assigned to that account.
ALTER TABLE categorias ADD COLUMN owner_id INT NULL;
ALTER TABLE proveedores ADD COLUMN owner_id INT NULL;
ALTER TABLE productos ADD COLUMN owner_id INT NULL;
ALTER TABLE movimientos ADD COLUMN owner_id INT NULL;

UPDATE categorias
SET owner_id = (SELECT id FROM usuarios WHERE usuario = 'admin' LIMIT 1)
WHERE owner_id IS NULL;

UPDATE proveedores
SET owner_id = (SELECT id FROM usuarios WHERE usuario = 'admin' LIMIT 1)
WHERE owner_id IS NULL;

UPDATE productos
SET owner_id = (SELECT id FROM usuarios WHERE usuario = 'admin' LIMIT 1)
WHERE owner_id IS NULL;

UPDATE movimientos m
LEFT JOIN productos p ON p.id = m.producto_id
SET m.owner_id = COALESCE(
  p.owner_id,
  (SELECT id FROM usuarios WHERE usuario = 'admin' LIMIT 1)
)
WHERE m.owner_id IS NULL;

ALTER TABLE categorias
  MODIFY owner_id INT NOT NULL,
  ADD KEY idx_categorias_owner (owner_id),
  ADD CONSTRAINT fk_categorias_owner FOREIGN KEY (owner_id)
    REFERENCES usuarios (id) ON DELETE CASCADE;

ALTER TABLE proveedores
  MODIFY owner_id INT NOT NULL,
  ADD KEY idx_proveedores_owner (owner_id),
  ADD CONSTRAINT fk_proveedores_owner FOREIGN KEY (owner_id)
    REFERENCES usuarios (id) ON DELETE CASCADE;

ALTER TABLE productos
  MODIFY owner_id INT NOT NULL,
  ADD KEY idx_productos_owner_activo (owner_id, activo),
  ADD CONSTRAINT fk_productos_owner FOREIGN KEY (owner_id)
    REFERENCES usuarios (id) ON DELETE CASCADE;

ALTER TABLE movimientos
  MODIFY owner_id INT NOT NULL,
  ADD KEY idx_movimientos_owner_fecha (owner_id, fecha),
  ADD CONSTRAINT fk_movimientos_owner FOREIGN KEY (owner_id)
    REFERENCES usuarios (id) ON DELETE CASCADE;

-- Categories may share a name across accounts; replace a legacy unique index
-- that only covered nombre with a tenant-scoped unique index.
SET @legacy_category_name_index = (
  SELECT index_name
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'categorias'
    AND non_unique = 0
  GROUP BY index_name
  HAVING GROUP_CONCAT(column_name ORDER BY seq_in_index) = 'nombre'
  LIMIT 1
);
SET @drop_legacy_category_index = IF(
  @legacy_category_name_index IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE categorias DROP INDEX `', REPLACE(@legacy_category_name_index, '`', '``'), '`')
);
PREPARE drop_legacy_category_index FROM @drop_legacy_category_index;
EXECUTE drop_legacy_category_index;
DEALLOCATE PREPARE drop_legacy_category_index;

ALTER TABLE categorias
  ADD UNIQUE KEY uq_categorias_owner_nombre (owner_id, nombre);
