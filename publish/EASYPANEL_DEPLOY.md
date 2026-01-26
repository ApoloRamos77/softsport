# 🚀 Guía de Despliegue en Easypanel - ADHSOFT SPORT

## 📋 Requisitos Previos

- Cuenta en Easypanel
- Acceso a SQL Server (local o remoto)
- Las carpetas `frontend/` y `backend/` ya compiladas

## 🎯 Opción 1: Despliegue con Docker (Recomendado)

### Paso 1: Preparar SQL Server

1. Asegúrate de que SQL Server esté accesible desde internet o configura un túnel
2. Ejecuta las migraciones desde la carpeta `migrations/`:
   ```bash
   cd ../migrations
   sqlcmd -S tu_servidor -U sa -P tu_password -d Sys_Academia -i init.sql
   ```

### Paso 2: Crear Servicios en Easypanel

#### A. Backend (API .NET)

1. En Easypanel, crea un nuevo **Service**
2. Selecciona **Docker** como tipo
3. Configuración:
   - **Name:** `softsport-backend`
   - **Docker Image:** Sube el Dockerfile desde `backend/`
   - **Port:** `5081`
   - **Environment Variables:**
     ```
     ASPNETCORE_ENVIRONMENT=Production
     ASPNETCORE_URLS=http://+:5081
     ConnectionStrings__DefaultConnection=Server=TU_SERVIDOR;Database=Sys_Academia;User Id=sa;Password=TU_PASSWORD;TrustServerCertificate=True
     ```
   - **Domain:** Asigna un dominio (ej: `api.tudominio.com`)

4. Sube los archivos del directorio `backend/` (incluyendo el Dockerfile)
5. Despliega el servicio

#### B. Frontend (React)

1. En Easypanel, crea un nuevo **Service**
2. Selecciona **Docker** como tipo
3. Configuración:
   - **Name:** `softsport-frontend`
   - **Docker Image:** Sube el Dockerfile desde `frontend/`
   - **Port:** `80`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://api.tudominio.com
     ```
   - **Domain:** Asigna un dominio (ej: `app.tudominio.com`)

4. **IMPORTANTE:** Antes de subir, actualiza la URL del API:
   - Abre `frontend/assets/index-*.js`
   - Busca `http://localhost:5081`
   - Reemplázalo con tu URL de producción del backend

5. Sube los archivos del directorio `frontend/` (incluyendo Dockerfile y nginx.conf)
6. Despliega el servicio

## 🎯 Opción 2: Despliegue Manual (Sin Docker)

### Backend

1. Crea un **App** service en Easypanel
2. Runtime: **.NET 9.0**
3. Sube el contenido de la carpeta `backend/`
4. Start Command: `dotnet SoftSportAPI.dll`
5. Port: `5081`
6. Variables de entorno (como se indica arriba)

### Frontend

1. Crea un **Static** service en Easypanel
2. Sube el contenido de la carpeta `frontend/`
3. Index file: `index.html`
4. SPA mode: **Enabled** (todas las rutas → index.html)

## ⚙️ Configuración Post-Despliegue

### 1. Actualizar CORS en el Backend

Edita `backend/appsettings.json` antes de subir:

```json
{
  "AllowedOrigins": [
    "https://app.tudominio.com",
    "http://localhost:3000"
  ]
}
```

### 2. SSL/HTTPS

Easypanel automáticamente genera certificados SSL. Asegúrate de:
- Usar HTTPS en producción
- Actualizar todas las URLs del frontend para usar HTTPS

### 3. Base de Datos

Si usas SQL Server externo:
- Configura el firewall para permitir la IP de Easypanel
- Usa una connection string con `TrustServerCertificate=True` o configura SSL

Si quieres SQL Server en Easypanel:
- Crea un servicio **Database** → SQL Server
- Usa el host interno de Easypanel en la connection string

## 🔍 Verificación

1. **Backend:** Accede a `https://api.tudominio.com/swagger`
2. **Frontend:** Accede a `https://app.tudominio.com`
3. **Login:** Usa las credenciales por defecto:
   - Usuario: `admin`
   - Password: `admin123`

## 📁 Estructura de Archivos Listos

```
publish/
├── frontend/
│   ├── Dockerfile          ✅ Creado
│   ├── nginx.conf          ✅ Creado
│   ├── index.html
│   ├── assets/
│   └── ...
├── backend/
│   ├── Dockerfile          ✅ Creado
│   ├── SoftSportAPI.dll
│   ├── appsettings.json
│   └── ...
├── docker-compose.yml      ✅ Creado
└── README.md
```

## 🐛 Troubleshooting

### Error de CORS
- Verifica que el dominio del frontend esté en `AllowedOrigins`
- Asegúrate de usar HTTPS en producción

### Error de Conexión a Base de Datos
- Verifica el connection string
- Verifica que SQL Server esté accesible
- Revisa el firewall de SQL Server

### Frontend muestra página en blanco
- Verifica que la URL del API esté correcta en los archivos JS
- Revisa la consola del navegador para errores
- Asegúrate de que el servidor esté configurado como SPA

## 📦 Comandos Útiles

### Probar Docker localmente:
```bash
cd publish
docker-compose up -d
```

### Ver logs en Easypanel:
- Accede al service → Logs tab

### Actualizar el deployment:
- Sube los nuevos archivos
- Click en "Redeploy"

## 🔐 Checklist de Seguridad

- [ ] Cambiar credenciales de base de datos
- [ ] Configurar HTTPS/SSL
- [ ] Actualizar CORS origins
- [ ] Cambiar password del usuario admin
- [ ] Habilitar logs de auditoría
- [ ] Configurar backups de base de datos
- [ ] Revisar variables de entorno sensibles

## 📞 Soporte

**Sistema:** ADHSOFT SPORT v1.0.0  
**Fecha:** Enero 2026  
**Stack:** React 19 + .NET 9.0 + SQL Server

---

**¡Todo listo para desplegar! 🎉**
