# Documentación Completa - Soft Sport API

## Tabla de Contenidos

1. [Endpoints de la API](#endpoints-de-la-api)
2. [Configuración de Base de Datos](#configuración-de-base-de-datos)
3. [CORS y Comunicación](#cors-y-comunicación)
4. [Troubleshooting](#troubleshooting)
5. [Desarrollo](#desarrollo)

## Endpoints de la API

La API REST proporciona endpoints CRUD completos para todas las entidades. Todos los endpoints siguen el patrón estándar REST.

### Gestión de Alumnos

**Base URL:** `/api/alumnos`

- `GET /api/alumnos` - Listar todos los alumnos (incluye representante, grupo, categoría y beca)
- `GET /api/alumnos/{id}` - Obtener un alumno por ID
- `POST /api/alumnos` - Crear nuevo alumno
- `PUT /api/alumnos/{id}` - Actualizar alumno existente
- `DELETE /api/alumnos/{id}` - Eliminar alumno

**Modelo Alumno:**
```json
{
  "nombre": "string",
  "apellido": "string",
  "documento": "string",
  "fechaNacimiento": "2010-05-12",
  "telefono": "string",
  "email": "string",
  "posicion": "Delantero",
  "numeroCamiseta": 10,
  "grupoId": 1,
  "categoriaId": 1,
  "becaId": 1,
  "estado": "Activo",
  "representanteId": 1
}
```

### Gestión de Representantes

**Base URL:** `/api/representantes`

- `GET /api/representantes` - Listar representantes
- `GET /api/representantes/{id}` - Obtener por ID
- `POST /api/representantes` - Crear representante
- `PUT /api/representantes/{id}` - Actualizar
- `DELETE /api/representantes/{id}` - Eliminar

**Modelo Representante:**
```json
{
  "nombre": "string",
  "apellido": "string",
  "documento": "string",
  "email": "string",
  "telefono": "string",
  "parentesco": "Padre",
  "direccion": "string"
}
```

### Gestión Académica

#### Categorías
**Base URL:** `/api/categorias`

```json
{
  "nombre": "Sub-15",
  "descripcion": "Categoría para edades 13-15",
  "edadMin": 13,
  "edadMax": 15
}
```

#### Grupos
**Base URL:** `/api/grupos`

```json
{
  "nombre": "Elite A",
  "descripcion": "Grupo elite avanzado"
}
```

#### Becas
**Base URL:** `/api/becas`

```json
{
  "nombre": "Beca Completa",
  "porcentaje": 100.00,
  "descripcion": "Beca del 100%"
}
```

### Gestión de Servicios y Productos

#### Servicios
**Base URL:** `/api/servicios`

```json
{
  "nombre": "Mensualidad Básica",
  "descripcion": "Mensualidad básica",
  "precio": 50.00,
  "activo": true
}
```

#### Productos
**Base URL:** `/api/productos`

```json
{
  "nombre": "Balón de fútbol",
  "sku": "BAL001",
  "descripcion": "Balón profesional",
  "precio": 25.00,
  "cantidad": 10
}
```

#### Métodos de Pago
**Base URL:** `/api/paymentmethods`

```json
{
  "nombre": "Efectivo",
  "descripcion": "Pago en efectivo",
  "currency": "USD",
  "activo": true
}
```

### Gestión de Recibos y Pagos

#### Recibos
**Base URL:** `/api/recibos`

```json
{
  "numero": "REC-001",
  "destinatarioType": "alumno",
  "destinatarioId": 1,
  "subtotal": 100.00,
  "descuento": 10.00,
  "total": 90.00,
  "estado": "Pendiente",
  "paymentMethodId": 1
}
```

### Gestión de Usuarios

**Base URL:** `/api/users`

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "4241234567",
  "role": "admin_all",
  "active": true
}
```

## Configuración de Base de Datos

### Cadena de Conexión

Archivo: `api/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=192.168.1.160,1433;Database=Sys_Academia;User Id=sa;Password=Mt$q12o15;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

### Estructura de Tablas

| Tabla | Descripción | Campos Principales |
|-------|-------------|--------------------|
| users | Usuarios del sistema | email, role, active |
| representantes | Padres/tutores | nombre, apellido, parentesco |
| alumnos | Estudiantes | nombre, posicion, grupoId |
| categorias | Categorías por edad | nombre, edadMin, edadMax |
| grupos | Grupos de entrenamiento | nombre |
| becas | Becas y descuentos | nombre, porcentaje |
| servicios | Servicios ofrecidos | nombre, precio |
| productos | Productos en venta | nombre, precio, cantidad |
| payment_methods | Métodos de pago | nombre, currency |
| recibos | Recibos/facturas | numero, total, estado |
| recibo_items | Items de recibos | tipo, cantidad, total |
| abonos | Pagos realizados | monto, referencia |

### Migraciones

Para recrear la base de datos:

```powershell
sqlcmd -S "192.168.1.160,1433" -U sa -P "Mt`$q12o15" -i "migrations\init.sql"
```

Para eliminar (ROLLBACK):

```powershell
sqlcmd -S "192.168.1.160,1433" -U sa -P "Mt`$q12o15" -i "migrations\rollback.sql"
```

## CORS y Comunicación

### Configuración CORS (Backend)

Archivo: `api/Program.cs`

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://172.16.11.92:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

### Cliente API (Frontend)

Archivo: `services/api.ts`

```typescript
const API_BASE_URL = 'http://localhost:5081/api';

// Ejemplo de uso
const alumnos = await apiService.getAlumnos();
const alumno = await apiService.createAlumno({ nombre: "Juan", ... });
```

## Troubleshooting

### 1. La API no se conecta a la BD

**Síntomas:**
- Error al iniciar la API
- Excepciones de SQL Server

**Soluciones:**
```powershell
# Verificar que SQL Server está corriendo
sqlcmd -S "192.168.1.160,1433" -U sa -P "Mt`$q12o15" -Q "SELECT @@VERSION"

# Verificar que la base de datos existe
sqlcmd -S "192.168.1.160,1433" -U sa -P "Mt`$q12o15" -Q "SELECT name FROM sys.databases WHERE name = 'Sys_Academia'"

# Revisar firewall y puerto 1433
Test-NetConnection -ComputerName 192.168.1.160 -Port 1433
```

### 2. Error de CORS en el frontend

**Síntomas:**
- "CORS policy" en consola del navegador
- Peticiones bloqueadas

**Soluciones:**
1. Verificar que la API está corriendo
2. Confirmar que el frontend usa `http://localhost:3000`
3. Revisar configuración CORS en `api/Program.cs`
4. Reiniciar ambos servicios

### 3. Error "Failed to fetch"

**Síntomas:**
- Frontend no carga datos
- Red tab muestra errores

**Soluciones:**
```powershell
# Verificar que la API responde
curl http://localhost:5081/api/alumnos

# O abrir en navegador
start http://localhost:5081/swagger
```

### 4. Problemas de compilación (.NET)

```powershell
# Limpiar y reconstruir
cd api
dotnet clean
dotnet restore
dotnet build
```

### 5. Frontend no compila

```powershell
# Limpiar node_modules
Remove-Item -Recurse -Force node_modules
npm.cmd install

# Limpiar caché de Vite
Remove-Item -Recurse -Force node_modules/.vite
npm.cmd run dev
```

## Desarrollo

### Agregar una Nueva Entidad

**1. Crear el modelo** (`api/Models/MiEntidad.cs`):

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("mi_entidad")]
    public class MiEntidad
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombre")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;
    }
}
```

**2. Agregar DbSet** (`api/Data/SoftSportDbContext.cs`):

```csharp
public DbSet<MiEntidad> MisEntidades { get; set; }
```

**3. Crear controlador** (`api/Controllers/MiEntidadController.cs`):

```csharp
[Route("api/[controller]")]
[ApiController]
public class MiEntidadController : ControllerBase
{
    private readonly SoftSportDbContext _context;

    public MiEntidadController(SoftSportDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MiEntidad>>> GetMisEntidades()
    {
        return await _context.MisEntidades.ToListAsync();
    }

    // ... más métodos CRUD
}
```

**4. Actualizar frontend** (`services/api.ts`):

```typescript
export interface MiEntidad {
  id?: number;
  nombre: string;
}

// En la clase ApiService:
getMisEntidades() { return this.getAll<MiEntidad>('mientidad'); }
```

### Ejecutar Migraciones EF Core

```powershell
cd api

# Crear migración
dotnet ef migrations add NombreMigracion

# Aplicar a BD
dotnet ef database update

# Revertir última migración
dotnet ef migrations remove
```

### Testing de la API

**Con Swagger UI:**
1. Abrir http://localhost:5081/swagger
2. Expandir el endpoint
3. Click en "Try it out"
4. Ingresar datos
5. Click en "Execute"

**Con PowerShell:**

```powershell
# GET
Invoke-RestMethod -Uri "http://localhost:5081/api/alumnos" -Method Get

# POST
$body = @{ nombre = "Juan"; apellido = "Pérez"; estado = "Activo" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5081/api/alumnos" -Method Post -Body $body -ContentType "application/json"

# PUT
$body = @{ id = 1; nombre = "Juan"; apellido = "Pérez"; estado = "Activo" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5081/api/alumnos/1" -Method Put -Body $body -ContentType "application/json"

# DELETE
Invoke-RestMethod -Uri "http://localhost:5081/api/alumnos/1" -Method Delete
```

## Performance y Optimización

### Paginación

Para grandes conjuntos de datos, considera implementar paginación:

```csharp
[HttpGet]
public async Task<ActionResult<IEnumerable<Alumno>>> GetAlumnos(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
{
    return await _context.Alumnos
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
}
```

### Caché

Considera implementar caché para datos que no cambian frecuentemente:

```csharp
builder.Services.AddMemoryCache();
```

### Logging

Para debug y monitoreo:

```csharp
private readonly ILogger<AlumnosController> _logger;

_logger.LogInformation("Fetching all alumnos");
_logger.LogError(ex, "Error fetching alumnos");
```

## Seguridad

### Autenticación JWT (Futuro)

Para implementar autenticación:

```powershell
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

### Validación de Datos

Los modelos ya incluyen validaciones con Data Annotations:
- `[Required]` - Campo obligatorio
- `[MaxLength]` - Longitud máxima
- `[EmailAddress]` - Formato de email

## Recursos

- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
