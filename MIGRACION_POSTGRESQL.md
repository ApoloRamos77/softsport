# 📊 Migración a PostgreSQL - ADHSOFT SPORT

## ¿Por qué PostgreSQL?

Easypanel no ofrece SQL Server como base de datos, pero sí PostgreSQL que es:
- ✅ Compatible con .NET/EF Core
- ✅ Open source y gratuito
- ✅ Excelente rendimiento
- ✅ Soporte nativo en Easypanel

## 🎯 Archivos Creados

1. **`migrations/init-postgresql.sql`** - Script de estructura completo
2. **`migrations/migrate-to-postgres.ps1`** - Script de migración de datos
3. **`api/appsettings.PostgreSQL.json`** - Configuración para PostgreSQL
4. **`api/SoftSportAPI.csproj`** - Actualizado con Npgsql
5. **`api/Program.cs`** - Soporte dual SQL Server/PostgreSQL

## 🚀 Pasos para Migrar

### Paso 1: Crear Base de Datos en Easypanel

1. En Easypanel, click **"+ Servicio"**
2. Selecciona **"Postgres"**
3. Configuración:
   - **Nombre:** `softsport-db`
   - **Usuario:** `postgres` (por defecto)
   - **Password:** `[elige-password-seguro]`
   - **Base de datos:** `sys_academia`

4. Guarda y espera que se inicie

### Paso 2: Crear Estructura de Tablas

1. Conéctate a PostgreSQL en Easypanel
2. Ejecuta el script: `migrations/init-postgresql.sql`

**Desde la interfaz de Easypanel:**
- Ve al servicio PostgreSQL
- Tab "SQL Editor" o "Terminal"
- Copia y pega el contenido de `init-postgresql.sql`
- Ejecuta

**O desde tu máquina (si tienes psql):**
```bash
psql -h [host-easypanel] -U postgres -d sys_academia -f migrations/init-postgresql.sql
```

### Paso 3: Migrar Datos (Opcional)

Si tienes datos en tu SQL Server actual:

**Opción A: Exportar/Importar Manual**

1. Ejecuta el script de exportación:
```powershell
cd migrations
.\migrate-to-postgres.ps1
```

2. Esto creará archivos CSV en `migration-export/`

3. Importa cada tabla en PostgreSQL:
```bash
\COPY tabla FROM 'archivo.csv' CSV HEADER
```

**Opción B: Comenzar de Cero**

Si prefieres empezar con datos limpios, el script `init-postgresql.sql` ya incluye:
- ✅ Métodos de pago por defecto
- ✅ Becas básicas
- ✅ Roles predefinidos
- ✅ Usuario admin (admin@softsport.com / admin123)

### Paso 4: Configurar Backend

En Easypanel, configura el servicio **api** con estas variables de entorno:

```bash
UsePostgreSQL=true
ConnectionStrings__DefaultConnection=Host=softsport-db;Database=sys_academia;Username=postgres;Password=TU_PASSWORD;SslMode=Prefer
```

**Importante:** 
- `softsport-db` es el nombre interno del servicio de PostgreSQL
- Usa el password que configuraste en Paso 1

### Paso 5: Reconstruir Backend

Como cambiamos el archivo `.csproj`, necesitas:

1. Hacer commit y push de los cambios:
```powershell
git add .
git commit -m "Agregar soporte para PostgreSQL"
git push
```

2. En Easypanel, el servicio backend se reconstruirá automáticamente

## 📋 Variables de Entorno Completas

### Backend (api)

```bash
# Habilitar PostgreSQL
UsePostgreSQL=true

# Connection String
ConnectionStrings__DefaultConnection=Host=softsport-db;Database=sys_academia;Username=postgres;Password=TU_PASSWORD_SEGURO;SslMode=Prefer

# Entorno
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5081

# CORS (actualiza con tus dominios reales)
AllowedOrigins__0=https://app.tudominio.com
AllowedOrigins__1=https://www.tudominio.com
```

## 🔍 Verificar la Migración

1. **Estructura:**
```sql
-- En PostgreSQL
\dt  -- Ver todas las tablas
\d users  -- Ver estructura de tabla users
```

2. **Datos:**
```sql
SELECT * FROM users;
SELECT * FROM payment_methods;
SELECT * FROM becas;
```

3. **Backend:**
- Accede a: `https://tu-api.easypanel.app/swagger`
- Prueba algún endpoint como `/api/users`

## 🔄 Compatibilidad SQL Server/PostgreSQL

El backend ahora soporta AMBAS bases de datos:

- **Desarrollo local:** SQL Server (UsePostgreSQL=false)
- **Producción Easypanel:** PostgreSQL (UsePostgreSQL=true)

## 🆘 Solución de Problemas

### Error: "No se puede conectar a PostgreSQL"

- Verifica que el servicio PostgreSQL esté corriendo en Easypanel
- Verifica el nombre del host (debe ser el nombre del servicio)
- Verifica el password

### Error: "Tabla no existe"

- Asegúrate de haber ejecutado `init-postgresql.sql`
- Verifica que estás en la base de datos correcta: `\c sys_academia`

### Error de conexión desde backend

- Verifica que el backend y PostgreSQL estén en el mismo proyecto de Easypanel
- Los servicios en el mismo proyecto pueden comunicarse por nombre

## 📊 Diferencias SQL Server vs PostgreSQL

| Característica | SQL Server | PostgreSQL |
|----------------|------------|------------|
| Auto increment | `IDENTITY(1,1)` | `SERIAL` |
| Texto variable | `NVARCHAR` | `VARCHAR` / `TEXT` |
| Booleano | `BIT` | `BOOLEAN` |
| Fecha/hora | `DATETIME2` | `TIMESTAMP` |
| Función actual | `SYSUTCDATETIME()` | `CURRENT_TIMESTAMP` |

Todo esto ya está convertido en `init-postgresql.sql` ✅

## ✅ Checklist

- [ ] PostgreSQL creado en Easypanel
- [ ] Script `init-postgresql.sql` ejecutado
- [ ] Datos migrados (si aplica)
- [ ] Variables de entorno configuradas en backend
- [ ] Código pusheado a GitHub
- [ ] Backend redesplegado
- [ ] Swagger accesible
- [ ] Frontend puede conectarse al API

## 📚 Recursos

- [Documentación PostgreSQL](https://www.postgresql.org/docs/)
- [Npgsql - Provider .NET](https://www.npgsql.org/)
- [EF Core con PostgreSQL](https://learn.microsoft.com/ef/core/providers/npgsql/)

---

**¿Listo para migrar?** Comienza con el Paso 1: Crear la base de datos en Easypanel.
