# Configuración de Base de Datos - ADHSOFT SPORT

## 📋 Información de Conexión Actual

**Servidor:** 192.168.1.160:1433
**Base de Datos:** Sys_Academia
**Usuario:** sa
**Motor:** SQL Server

## 🔧 Cambiar Connection String

Edita el archivo `appsettings.json` en esta carpeta y actualiza:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=Sys_Academia;User Id=TU_USUARIO;Password=TU_PASSWORD;TrustServerCertificate=True"
  }
}
```

## 📁 Scripts de Base de Datos

Los scripts SQL están en la carpeta `migrations/` del proyecto original:

1. `init.sql` - Creación inicial de todas las tablas
2. `add-default-user.sql` - Usuario administrador por defecto
3. `roles-migration.sql` - Sistema de roles y permisos
4. Otros scripts adicionales para características específicas

## 🚀 Crear la Base de Datos

### Opción 1: SQL Server Management Studio (SSMS)
1. Conecta a tu servidor SQL Server
2. Crea una nueva base de datos llamada `Sys_Academia`
3. Ejecuta los scripts en orden desde la carpeta `migrations/`

### Opción 2: Línea de comandos
```bash
sqlcmd -S TU_SERVIDOR -U sa -P TU_PASSWORD -Q "CREATE DATABASE Sys_Academia"
sqlcmd -S TU_SERVIDOR -U sa -P TU_PASSWORD -d Sys_Academia -i ruta\a\migrations\init.sql
sqlcmd -S TU_SERVIDOR -U sa -P TU_PASSWORD -d Sys_Academia -i ruta\a\migrations\add-default-user.sql
```

## 👤 Usuario por Defecto

Después de ejecutar los scripts, puedes iniciar sesión con:

**Email:** admin@adhsoft.com
**Password:** Admin123

⚠️ **IMPORTANTE:** Cambia esta contraseña inmediatamente después del primer inicio de sesión en producción.

## 🔐 Seguridad

Para producción:
- ✅ Usa Windows Authentication en lugar de SQL Authentication si es posible
- ✅ Crea un usuario SQL específico con permisos mínimos (no uses 'sa')
- ✅ Habilita SSL/TLS para conexiones a la base de datos
- ✅ Configura firewall para permitir solo IPs autorizadas
- ✅ Realiza backups automáticos diarios

## 📊 Tablas Principales

El sistema incluye las siguientes tablas:
- Alumnos (estudiantes)
- Representantes (padres/tutores)
- Entrenamientos (sesiones de entrenamiento)
- Juegos (partidos)
- Recibos (ingresos)
- Expenses (egresos)
- Abonos (pagos)
- Becas (scholarships)
- Categorias (grupos de edad)
- Grupos (equipos)
- Servicios (servicios ofrecidos)
- Productos (artículos vendibles)
- PaymentMethods (métodos de pago)
- Temporadas (seasons)
- Usuarios y Roles (autenticación)
