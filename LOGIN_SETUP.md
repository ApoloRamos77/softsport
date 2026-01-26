# Instrucciones para configurar el Login

## 1. Crear usuario de prueba en la base de datos

Ejecuta la siguiente migración SQL:

```powershell
cd c:\Proyecto_2026\Soft_Sport
sqlcmd -S localhost -d SoftSportDB -E -i "migrations\add-default-user.sql"
```

Si no tienes sqlcmd instalado, puedes ejecutar manualmente en SQL Server Management Studio:

```sql
INSERT INTO users (nombre, apellido, email, password_hash, telefono, role, active, created_at, updated_at)
VALUES ('Admin', 'User', 'admin@adhsoft.com', 'admin123', '+51977816213', 'Administrador', 1, GETDATE(), GETDATE());
```

## 2. Verificar que el backend esté ejecutándose

Asegúrate de que el backend esté corriendo en http://localhost:5081

```powershell
cd c:\Proyecto_2026\Soft_Sport\api
dotnet run
```

## 3. Credenciales de prueba

- **Email:** admin@adhsoft.com
- **Password:** admin123

## 4. Verificar el endpoint de login

Puedes probar el endpoint manualmente:

```powershell
curl -X POST http://localhost:5081/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@adhsoft.com\",\"password\":\"admin123\"}'
```

## 5. Errores comunes

### "Unexpected end of JSON input"
- **Causa:** El backend no está ejecutándose o no responde correctamente
- **Solución:** Verifica que dotnet esté corriendo en el puerto 5081

### "Credenciales inválidas"
- **Causa:** El usuario no existe en la base de datos
- **Solución:** Ejecuta la migración add-default-user.sql

### "No se puede conectar con el servidor"
- **Causa:** El frontend no puede alcanzar el backend
- **Solución:** Verifica CORS y que ambos servicios estén corriendo
