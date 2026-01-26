# Despliegue en Easypanel - ADHSOFT SPORT Backend

## Configuración del Servicio en Easypanel

### 1. Crear App desde GitHub

1. Ve a tu proyecto en Easypanel
2. Crea un nuevo servicio de tipo "App"
3. Selecciona "From GitHub Repository"
4. Conecta con: `ApoloRamos77/softsport`
5. Branch: `main`

### 2. Configuración de Build

- **Build Method**: Dockerfile
- **Dockerfile Path**: `Dockerfile` (en la raíz)
- **Build Context**: `.` (raíz del repositorio)

### 3. Variables de Entorno

Configura las siguientes variables de entorno en Easypanel:

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
UsePostgreSQL=true
```

**Cadena de conexión (ya configurada en appsettings.Production.json):**
```
Host=76.13.164.224
Port=5432
Database=sys_academia
Username=postgres
Password=SoftSport2026#
```

### 4. Configuración de Puertos

- **Container Port**: 8080
- **Public Port**: Asignado automáticamente por Easypanel

### 5. Dominio

El servicio estará disponible en:
```
https://softsport77-api.scuiaw.easypanel.host
```

### 6. Health Check (Opcional)

- **Path**: `/api/users` o `/swagger`
- **Port**: 8080
- **Timeout**: 30s
- **Interval**: 30s

## Verificación

Después del deploy, verifica:

1. Logs del contenedor muestran: `Now listening on: http://[::]:8080`
2. Endpoint de prueba: `https://softsport77-api.scuiaw.easypanel.host/api/users`
3. Swagger UI: `https://softsport77-api.scuiaw.easypanel.host/swagger`

## Troubleshooting

### Error 502 - Bad Gateway

**Causa común**: El contenedor no está escuchando en el puerto correcto.

**Solución**:
- Verificar que `ASPNETCORE_URLS=http://+:8080` esté configurado
- Verificar logs del contenedor en Easypanel
- Asegurar que el puerto del contenedor sea 8080

### Error de Conexión a Base de Datos

**Verificar**:
- La IP `76.13.164.224` es accesible desde Easypanel
- El puerto 5432 está abierto en el firewall de PostgreSQL
- Las credenciales son correctas

### El servicio se inicia pero no responde

**Verificar**:
1. Logs del contenedor (`docker logs`)
2. CORS configurado correctamente
3. PostgreSQL está aceptando conexiones remotas

## Actualizar Deployment

Cada vez que hagas push a la rama `main` en GitHub:

1. Easypanel detectará los cambios automáticamente
2. Reconstruirá la imagen Docker
3. Desplegará la nueva versión

O puedes forzar un redeploy desde el panel de Easypanel.

## Comandos de Verificación Local

Para probar el Dockerfile localmente:

```bash
# Construir imagen
docker build -t softsport-api:local .

# Ejecutar contenedor
docker run -p 8080:8080 -e ASPNETCORE_ENVIRONMENT=Production softsport-api:local

# Probar endpoint
curl http://localhost:8080/api/users
```
