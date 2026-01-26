-- ====================================================================
-- Migración a PostgreSQL - ADHSOFT SPORT
-- ====================================================================
-- Base de datos: sys_academia
-- Convertido desde SQL Server

-- Crear la base de datos (ejecutar como superusuario)
-- CREATE DATABASE sys_academia;
-- \c sys_academia

-- ====================================================================
-- USUARIOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(512),
    telefono VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- ====================================================================
-- REPRESENTANTES
-- ====================================================================
CREATE TABLE IF NOT EXISTS representantes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(50),
    email VARCHAR(255),
    telefono VARCHAR(50),
    parentesco VARCHAR(50),
    direccion VARCHAR(250),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- CATEGORÍAS
-- ====================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    edad_min INTEGER,
    edad_max INTEGER
);

-- ====================================================================
-- GRUPOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS grupos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500)
);

-- ====================================================================
-- BECAS / SCHOLARSHIPS
-- ====================================================================
CREATE TABLE IF NOT EXISTS becas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    descripcion VARCHAR(500)
);

-- ====================================================================
-- ALUMNOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS alumnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(50),
    fecha_nacimiento DATE,
    telefono VARCHAR(50),
    email VARCHAR(255),
    posicion VARCHAR(50),
    numero_camiseta INTEGER,
    grupo_id INTEGER,
    categoria_id INTEGER,
    beca_id INTEGER,
    estado VARCHAR(50) DEFAULT 'Activo',
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    representante_id INTEGER,
    CONSTRAINT fk_alumnos_representante FOREIGN KEY (representante_id) REFERENCES representantes(id),
    CONSTRAINT fk_alumnos_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id),
    CONSTRAINT fk_alumnos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT fk_alumnos_beca FOREIGN KEY (beca_id) REFERENCES becas(id)
);

-- ====================================================================
-- SERVICIOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    precio DECIMAL(12,2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true
);

-- ====================================================================
-- PRODUCTOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    sku VARCHAR(100),
    descripcion VARCHAR(500),
    precio DECIMAL(12,2) NOT NULL DEFAULT 0,
    cantidad INTEGER NOT NULL DEFAULT 0
);

-- ====================================================================
-- MÉTODOS DE PAGO
-- ====================================================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    currency VARCHAR(10),
    activo BOOLEAN NOT NULL DEFAULT true
);

-- ====================================================================
-- RECIBOS (INVOICES)
-- ====================================================================
CREATE TABLE IF NOT EXISTS recibos (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50),
    destinatario_type VARCHAR(50), -- 'alumno','grupo','categoria','todos'
    destinatario_id INTEGER,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    payment_method_id INTEGER,
    created_by INTEGER
);

-- ====================================================================
-- RECIBO ITEMS
-- ====================================================================
CREATE TABLE IF NOT EXISTS recibo_items (
    id SERIAL PRIMARY KEY,
    recibo_id INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'servicio'|'producto'
    item_id INTEGER,
    descripcion VARCHAR(500),
    precio_unitario DECIMAL(12,2) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    total DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_recibo_items_recibo FOREIGN KEY (recibo_id) REFERENCES recibos(id)
);

-- ====================================================================
-- ABONOS / PAGOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS abonos (
    id SERIAL PRIMARY KEY,
    recibo_id INTEGER,
    monto DECIMAL(12,2) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method_id INTEGER,
    referencia VARCHAR(200),
    CONSTRAINT fk_abonos_recibo FOREIGN KEY (recibo_id) REFERENCES recibos(id)
);

-- ====================================================================
-- TEMPORADAS (SEASONS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS seasons (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN NOT NULL DEFAULT true
);

-- ====================================================================
-- BECAS POR ALUMNO
-- ====================================================================
CREATE TABLE IF NOT EXISTS alumno_becas (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL,
    beca_id INTEGER NOT NULL,
    fecha_asignada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alumno_becas_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    CONSTRAINT fk_alumno_becas_beca FOREIGN KEY (beca_id) REFERENCES becas(id)
);

-- ====================================================================
-- ENTRENAMIENTOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS trainings (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion VARCHAR(1000),
    fecha TIMESTAMP,
    entrenador_id INTEGER
);

-- ====================================================================
-- JUEGOS / PARTIDOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200),
    fecha TIMESTAMP,
    ubicacion VARCHAR(250),
    rival VARCHAR(200),
    score_local INTEGER,
    score_visitante INTEGER
);

-- ====================================================================
-- PIZARRAS TÁCTICAS
-- ====================================================================
CREATE TABLE IF NOT EXISTS tactical_boards (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200),
    data TEXT, -- JSON o formato serializado
    created_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- GASTOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(500),
    monto DECIMAL(12,2) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    categoria VARCHAR(150),
    referencia VARCHAR(200),
    estado VARCHAR(50) DEFAULT 'Pendiente'
);

-- ====================================================================
-- CONTABILIDAD
-- ====================================================================
CREATE TABLE IF NOT EXISTS accounting_entries (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(500),
    monto DECIMAL(12,2) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    referencia VARCHAR(200)
);

-- ====================================================================
-- ROLES Y PERMISOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    resource VARCHAR(100) NOT NULL,
    can_create BOOLEAN NOT NULL DEFAULT false,
    can_read BOOLEAN NOT NULL DEFAULT false,
    can_update BOOLEAN NOT NULL DEFAULT false,
    can_delete BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- ====================================================================
-- CONFIGURACIÓN DE ACADEMIA
-- ====================================================================
CREATE TABLE IF NOT EXISTS academy_config (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200),
    logo_url VARCHAR(500),
    direccion VARCHAR(500),
    telefono VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- ====================================================================
-- DATOS INICIALES
-- ====================================================================

-- Métodos de pago por defecto
INSERT INTO payment_methods (nombre, descripcion, currency, activo)
SELECT 'Efectivo', 'Pago en efectivo', 'USD', true
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE nombre = 'Efectivo');

INSERT INTO payment_methods (nombre, descripcion, currency, activo)
SELECT 'Tarjeta', 'Pago con tarjeta', 'USD', true
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE nombre = 'Tarjeta');

INSERT INTO payment_methods (nombre, descripcion, currency, activo)
SELECT 'Transferencia', 'Transferencia bancaria', 'USD', true
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE nombre = 'Transferencia');

-- Becas por defecto
INSERT INTO becas (nombre, porcentaje, descripcion)
SELECT 'Beca Completa', 100.00, 'Beca del 100%'
WHERE NOT EXISTS (SELECT 1 FROM becas WHERE nombre = 'Beca Completa');

INSERT INTO becas (nombre, porcentaje, descripcion)
SELECT 'Beca Parcial', 50.00, 'Beca del 50%'
WHERE NOT EXISTS (SELECT 1 FROM becas WHERE nombre = 'Beca Parcial');

INSERT INTO becas (nombre, porcentaje, descripcion)
SELECT 'Sin Beca', 0.00, 'Sin descuento'
WHERE NOT EXISTS (SELECT 1 FROM becas WHERE nombre = 'Sin Beca');

-- Roles por defecto
INSERT INTO roles (name, description)
SELECT 'admin', 'Administrador del sistema'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin');

INSERT INTO roles (name, description)
SELECT 'entrenador', 'Entrenador'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'entrenador');

INSERT INTO roles (name, description)
SELECT 'recepcionista', 'Recepcionista'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'recepcionista');

-- Usuario admin por defecto (password: admin123)
INSERT INTO users (nombre, apellido, email, password_hash, role, active)
SELECT 'Admin', 'Sistema', 'admin@softsport.com', 
       '$2a$11$xJWZ7h5K5YmPvP0g.nLYxOK8nJx8J5XrYBxJz3h5K5YmPvP0g.nLYx', 
       'admin', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@softsport.com');

-- ====================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_alumnos_representante ON alumnos(representante_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_grupo ON alumnos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_categoria ON alumnos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_estado ON alumnos(estado);
CREATE INDEX IF NOT EXISTS idx_recibos_fecha ON recibos(fecha);
CREATE INDEX IF NOT EXISTS idx_recibos_estado ON recibos(estado);
CREATE INDEX IF NOT EXISTS idx_abonos_recibo ON abonos(recibo_id);
CREATE INDEX IF NOT EXISTS idx_abonos_fecha ON abonos(fecha);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ====================================================================
-- COMENTARIOS EN TABLAS
-- ====================================================================

COMMENT ON TABLE users IS 'Usuarios del sistema';
COMMENT ON TABLE alumnos IS 'Estudiantes/jugadores registrados';
COMMENT ON TABLE recibos IS 'Facturas/recibos generados';
COMMENT ON TABLE abonos IS 'Pagos realizados';
COMMENT ON TABLE expenses IS 'Gastos de la academia';

-- ====================================================================
-- FIN DE MIGRACIÓN
-- ====================================================================

SELECT 'Migración a PostgreSQL completada exitosamente!' as mensaje;
