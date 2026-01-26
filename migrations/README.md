# Migraciones de Base de Datos - Sys_Academia

Este proyecto utiliza SQL Server para la base de datos `Sys_Academia`. A continuación se describen las herramientas y comandos para gestionar las migraciones.

## Configuración

La configuración de conexión se encuentra en [`webconfig.json`](../webconfig.json):

```json
{
  "db": {
    "server": "192.168.1.160",
    "port": 1433,
    "user": "sa",
    "password": "Mt$q12o15",
    "database": "Sys_Academia"
  }
}
```

## Requisitos Previos

- **SQL Server** instalado y accesible en `192.168.1.160:1433`
- **sqlcmd** (cliente de línea de comandos de SQL Server) instalado y disponible en PATH
- Permisos de administrador (usuario `sa`) en el servidor SQL

### Verificar sqlcmd

```powershell
sqlcmd -?
```

Si no está disponible, instala [SQL Server Command Line Utilities](https://learn.microsoft.com/en-us/sql/tools/sqlcmd/sqlcmd-utility).

## Estructura de la Base de Datos

La base de datos `Sys_Academia` incluye las siguientes tablas:

### Tablas Principales

- **users** - Usuarios del sistema (administradores, entrenadores)
- **representantes** - Representantes de alumnos (padres, tutores)
- **alumnos** - Alumnos de la academia
- **categorias** - Categorías por edad (Sub-12, Sub-15, etc.)
- **grupos** - Grupos de entrenamiento (Elite A, Básico, etc.)
- **becas** - Becas y descuentos

### Gestión Académica

- **trainings** - Entrenamientos programados
- **games** - Partidos y juegos
- **tactical_boards** - Pizarras tácticas
- **seasons** - Temporadas deportivas

### Finanzas

- **servicios** - Servicios ofrecidos (mensualidades, etc.)
- **productos** - Productos en venta
- **payment_methods** - Métodos de pago
- **recibos** - Recibos/facturas generados
- **recibo_items** - Items de cada recibo
- **abonos** - Pagos realizados
- **expenses** - Gastos
- **accounting_entries** - Registros contables

## Comandos

### Ejecutar Migración Inicial

Crea la base de datos `Sys_Academia` y todas las tablas:

```powershell
cd C:\Proyecto_2026\Soft_Sport
sqlcmd -S "192.168.1.160,1433" -U sa -P "Mt`$q12o15" -i "migrations\init.sql"
```

O usando el script PowerShell:

```powershell
.\migrations\run-migrations.ps1
```

### Ejecutar Rollback (Eliminar BD)

**⚠️ ADVERTENCIA**: Esto eliminará PERMANENTEMENTE la base de datos y todos los datos.

```powershell
sqlcmd -S "192.168.1.160,1433" -U sa -P "Mt`$q12o15" -i "migrations\rollback.sql"
```

### Verificar Estado de la Migración

Consultar si la base de datos existe:

```powershell
sqlcmd -S "192.168.1.160,1433" -U sa -P "Mt`$q12o15" -Q "SELECT name FROM sys.databases WHERE name = 'Sys_Academia'"
```

Listar todas las tablas:

```powershell
sqlcmd -S "192.168.1.160,1433" -U sa -P "Mt`$q12o15" -d "Sys_Academia" -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
```

## Logs

Los resultados de las migraciones se guardan automáticamente en:

- `migrations/migration_output.log` - Output de la última migración ejecutada

## Troubleshooting

### Error: "sqlcmd no se reconoce como comando"

Instala SQL Server Command Line Utilities o añade sqlcmd al PATH del sistema.

### Error de conexión al servidor

- Verifica que el servidor SQL Server esté corriendo en `192.168.1.160:1433`
- Comprueba que el puerto 1433 esté abierto en el firewall
- Verifica las credenciales (usuario: `sa`, password: `Mt$q12o15`)

### Error: "Login failed for user 'sa'"

- Verifica que la autenticación SQL Server esté habilitada
- Confirma que las credenciales sean correctas
- Asegúrate de que el usuario `sa` tenga permisos suficientes

## Próximos Pasos

1. **Conectar la aplicación**: Actualizar `services/db.ts` para usar SQL Server en lugar de localStorage
2. **ORM**: Considerar usar Sequelize, TypeORM, o Prisma para interactuar con la BD
3. **Migrations versionadas**: Implementar un sistema de migraciones incrementales con timestamps

## Recursos

- [SQL Server Documentation](https://learn.microsoft.com/en-us/sql/sql-server/)
- [sqlcmd Utility](https://learn.microsoft.com/en-us/sql/tools/sqlcmd/sqlcmd-utility)
- [Node.js SQL Server Driver (tedious)](https://www.npmjs.com/package/tedious)
- [Sequelize ORM](https://sequelize.org/)
