-- Inicialización de la base de datos Sys_Academia y tablas principales
-- Ejecutar en un servidor MS SQL (SQL Server)

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'Sys_Academia')
BEGIN
    CREATE DATABASE Sys_Academia;
END
GO

USE Sys_Academia;
GO

-- Usuarios
IF OBJECT_ID('dbo.users', 'U') IS NULL
CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    apellido NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(512) NULL,
    telefono NVARCHAR(50) NULL,
    role NVARCHAR(50) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NULL
);
GO

-- Representantes
IF OBJECT_ID('dbo.representantes', 'U') IS NULL
CREATE TABLE dbo.representantes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    apellido NVARCHAR(100) NOT NULL,
    documento NVARCHAR(50) NULL,
    email NVARCHAR(255) NULL,
    telefono NVARCHAR(50) NULL,
    parentesco NVARCHAR(50) NULL,
    direccion NVARCHAR(250) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- Categorías
IF OBJECT_ID('dbo.categorias', 'U') IS NULL
CREATE TABLE dbo.categorias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(500) NULL,
    edad_min INT NULL,
    edad_max INT NULL
);
GO

-- Grupos
IF OBJECT_ID('dbo.grupos', 'U') IS NULL
CREATE TABLE dbo.grupos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(500) NULL
);
GO

-- Becas / Scholarships
IF OBJECT_ID('dbo.becas', 'U') IS NULL
CREATE TABLE dbo.becas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    descripcion NVARCHAR(500) NULL
);
GO

-- Alumnos
IF OBJECT_ID('dbo.alumnos', 'U') IS NULL
CREATE TABLE dbo.alumnos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    apellido NVARCHAR(100) NOT NULL,
    documento NVARCHAR(50) NULL,
    fecha_nacimiento DATE NULL,
    telefono NVARCHAR(50) NULL,
    email NVARCHAR(255) NULL,
    posicion NVARCHAR(50) NULL,
    numero_camiseta INT NULL,
    grupo_id INT NULL,
    categoria_id INT NULL,
    beca_id INT NULL,
    estado NVARCHAR(50) DEFAULT 'Activo',
    fecha_registro DATE NOT NULL DEFAULT CONVERT(date, SYSUTCDATETIME()),
    representante_id INT NULL,
    CONSTRAINT FK_alumnos_representante FOREIGN KEY (representante_id) REFERENCES dbo.representantes(id),
    CONSTRAINT FK_alumnos_grupo FOREIGN KEY (grupo_id) REFERENCES dbo.grupos(id),
    CONSTRAINT FK_alumnos_categoria FOREIGN KEY (categoria_id) REFERENCES dbo.categorias(id),
    CONSTRAINT FK_alumnos_beca FOREIGN KEY (beca_id) REFERENCES dbo.becas(id)
);
GO

-- Servicios
IF OBJECT_ID('dbo.servicios', 'U') IS NULL
CREATE TABLE dbo.servicios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    descripcion NVARCHAR(500) NULL,
    precio DECIMAL(12,2) NOT NULL DEFAULT 0,
    activo BIT NOT NULL DEFAULT 1
);
GO

-- Productos
IF OBJECT_ID('dbo.productos', 'U') IS NULL
CREATE TABLE dbo.productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    sku NVARCHAR(100) NULL,
    descripcion NVARCHAR(500) NULL,
    precio DECIMAL(12,2) NOT NULL DEFAULT 0,
    cantidad INT NOT NULL DEFAULT 0
);
GO

-- Métodos de pago
IF OBJECT_ID('dbo.payment_methods', 'U') IS NULL
CREATE TABLE dbo.payment_methods (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    descripcion NVARCHAR(500) NULL,
    currency NVARCHAR(10) NULL,
    activo BIT NOT NULL DEFAULT 1
);
GO

-- Recibos (invoices)
IF OBJECT_ID('dbo.recibos', 'U') IS NULL
CREATE TABLE dbo.recibos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero NVARCHAR(50) NULL,
    destinatario_type NVARCHAR(50) NULL, -- 'alumno','grupo','categoria','todos'
    destinatario_id INT NULL,
    fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado NVARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    payment_method_id INT NULL,
    created_by INT NULL
);
GO

-- Recibo items
IF OBJECT_ID('dbo.recibo_items', 'U') IS NULL
CREATE TABLE dbo.recibo_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    recibo_id INT NOT NULL,
    tipo NVARCHAR(20) NOT NULL, -- 'servicio'|'producto'
    item_id INT NULL,
    descripcion NVARCHAR(500) NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    total DECIMAL(12,2) NOT NULL,
    CONSTRAINT FK_recibo_items_recibo FOREIGN KEY (recibo_id) REFERENCES dbo.recibos(id)
);
GO

-- Abonos / Pagos
IF OBJECT_ID('dbo.abonos', 'U') IS NULL
CREATE TABLE dbo.abonos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    recibo_id INT NULL,
    monto DECIMAL(12,2) NOT NULL,
    fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    payment_method_id INT NULL,
    referencia NVARCHAR(200) NULL,
    CONSTRAINT FK_abonos_recibo FOREIGN KEY (recibo_id) REFERENCES dbo.recibos(id)
);
GO

-- Temporadas (Seasons)
IF OBJECT_ID('dbo.seasons', 'U') IS NULL
CREATE TABLE dbo.seasons (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    fecha_inicio DATE NULL,
    fecha_fin DATE NULL,
    activo BIT NOT NULL DEFAULT 1
);
GO

-- Becas específicas por alumno (opcional)
IF OBJECT_ID('dbo.alumno_becas', 'U') IS NULL
CREATE TABLE dbo.alumno_becas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    alumno_id INT NOT NULL,
    beca_id INT NOT NULL,
    fecha_asignada DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_alumno_becas_alumno FOREIGN KEY (alumno_id) REFERENCES dbo.alumnos(id),
    CONSTRAINT FK_alumno_becas_beca FOREIGN KEY (beca_id) REFERENCES dbo.becas(id)
);
GO

-- Entrenamientos
IF OBJECT_ID('dbo.trainings', 'U') IS NULL
CREATE TABLE dbo.trainings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    titulo NVARCHAR(200) NOT NULL,
    descripcion NVARCHAR(1000) NULL,
    fecha DATETIME2 NULL,
    entrenador_id INT NULL
);
GO

-- Juegos / Partidos
IF OBJECT_ID('dbo.games', 'U') IS NULL
CREATE TABLE dbo.games (
    id INT IDENTITY(1,1) PRIMARY KEY,
    titulo NVARCHAR(200) NULL,
    fecha DATETIME2 NULL,
    ubicacion NVARCHAR(250) NULL,
    rival NVARCHAR(200) NULL,
    score_local INT NULL,
    score_visitante INT NULL
);
GO

-- Pizarras tácticas y plays
IF OBJECT_ID('dbo.tactical_boards', 'U') IS NULL
CREATE TABLE dbo.tactical_boards (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(200) NULL,
    data NVARCHAR(MAX) NULL, -- JSON o formato serializado
    created_by INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- Gastos
IF OBJECT_ID('dbo.expenses', 'U') IS NULL
CREATE TABLE dbo.expenses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    descripcion NVARCHAR(500) NULL,
    monto DECIMAL(12,2) NOT NULL,
    fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    categoria NVARCHAR(150) NULL,
    referencia NVARCHAR(200) NULL
);
GO

-- Contabilidad (registros contables básicos)
IF OBJECT_ID('dbo.accounting_entries', 'U') IS NULL
CREATE TABLE dbo.accounting_entries (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo NVARCHAR(50) NOT NULL,
    descripcion NVARCHAR(500) NULL,
    monto DECIMAL(12,2) NOT NULL,
    fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    referencia NVARCHAR(200) NULL
);
GO

-- Índices y datos iniciales (ejemplos)
INSERT INTO dbo.payment_methods (nombre, descripcion, currency, activo)
SELECT 'Efectivo', 'Pago en efectivo', 'USD', 1
WHERE NOT EXISTS (SELECT 1 FROM dbo.payment_methods WHERE nombre = 'Efectivo');

INSERT INTO dbo.becas (nombre, porcentaje, descripcion)
SELECT 'Beca Completa', 100.00, 'Beca del 100%'
WHERE NOT EXISTS (SELECT 1 FROM dbo.becas WHERE nombre = 'Beca Completa');

GO

PRINT 'Migración completada.';
