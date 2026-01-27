# Sistema de Contraseñas con BCrypt

## Cambios Implementados

Se ha implementado un sistema de hashing de contraseñas usando **BCrypt.Net-Next** para mejorar la seguridad de la aplicación.

### ¿Qué cambió?

1. **Contraseñas Hasheadas**: Las contraseñas ahora se almacenan hasheadas en la base de datos usando BCrypt
2. **Verificación Segura**: El login verifica contraseñas usando `BCrypt.Verify()`
3. **Auto-Hash**: Al crear o actualizar usuarios, las contraseñas se hashean automáticamente

### Credenciales Actuales

**Usuario Administrador:**
- **Email**: `admin@softsport.com`
- **Contraseña**: `Apolo123`

La contraseña se almacena en la base de datos como hash BCrypt (no en texto plano).

## Para Desarrolladores

### Crear Nuevos Usuarios

Al crear un usuario desde el frontend o API, simplemente envía la contraseña en texto plano. El sistema la hasheará automáticamente:

```csharp
// El sistema automáticamente hashea la contraseña
var user = new User 
{
    Email = "usuario@example.com",
    PasswordHash = "MiContraseña123"  // Se hasheará automáticamente
};
```

### Verificar Contraseñas

El login verifica automáticamente usando BCrypt:

```csharp
// En AuthController
if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
{
    return Unauthorized();
}
```

### Actualizar Contraseña de Usuario Existente

Si necesitas actualizar la contraseña del admin u otro usuario en la base de datos:

```bash
# Opción 1: Usar el programa C#
cd migrations/UpdateAdminPassword
dotnet run

# Opción 2: Ejecutar SQL manualmente
# Ver: migrations/update-admin-password.sql
```

### Generar Hash Manualmente

Si necesitas generar un hash de contraseña manualmente:

```csharp
using BCrypt.Net;

var password = "MiContraseña123";
var hash = BCrypt.Net.BCrypt.HashPassword(password);
Console.WriteLine(hash);
```

## Deployment en Easypanel

### Pasos para Actualizar

1. **Backend (API)**:
   - Ve a Easypanel → Proyecto → Servicio "api"
   - Clic en **"Rebuild"**
   - Espera a que termine el despliegue

2. **Verificación**:
   - Accede a: `https://softsport77-api.scuiaw.easypanel.host/swagger`
   - Prueba el endpoint `/api/auth/login` con:
     ```json
     {
       "email": "admin@softsport.com",
       "password": "Apolo123"
     }
     ```

3. **Frontend**:
   - No requiere cambios
   - El login funcionará automáticamente con la nueva API

## Seguridad

- **BCrypt Cost Factor**: 11 (balance entre seguridad y rendimiento)
- **Salt**: Generado automáticamente por BCrypt
- **No Reversible**: Los hashes no pueden ser revertidos a la contraseña original

## Migración de Usuarios Existentes

Si tienes usuarios con contraseñas en texto plano, necesitarás:

1. Pedirles que restablezcan su contraseña, O
2. Ejecutar un script de migración para hashear las contraseñas existentes

Ver el script de ejemplo en: `migrations/UpdateAdminPassword/`

## Archivos Modificados

- `api/Controllers/AuthController.cs` - Verificación con BCrypt
- `api/Controllers/UsersController.cs` - Auto-hash al crear/actualizar
- `api/SoftSportAPI.csproj` - Añadido BCrypt.Net-Next
- `migrations/UpdateAdminPassword/` - Script de actualización
- `migrations/update-admin-password.sql` - SQL de actualización
