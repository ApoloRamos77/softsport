# ADHSOFT SPORT - Archivos de Producción

## 📁 Estructura de Carpetas

```
publish/
├── frontend/          # Aplicación React compilada (archivos estáticos)
├── backend/           # API .NET publicada
└── README.md          # Este archivo
```

## 🚀 Instrucciones de Despliegue

### Frontend (React + Vite)

**Ubicación:** `publish/frontend/`

**Opciones de Hosting:**

1. **Hosting Estático (Vercel, Netlify, GitHub Pages)**
   - Sube toda la carpeta `frontend/`
   - Configura el directorio raíz como la carpeta subida
   - No requiere configuración adicional

2. **Servidor Web (Apache, Nginx, IIS)**
   - Copia el contenido de `frontend/` al directorio web
   - Configura el servidor para servir `index.html` en todas las rutas (SPA)
   
   **Ejemplo Nginx:**
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
   
   **Ejemplo Apache (.htaccess):**
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </IfModule>
   ```

3. **Azure Static Web Apps**
   - Sube la carpeta `frontend/`
   - Configura como aplicación estática

### Backend (API .NET)

**Ubicación:** `publish/backend/`

**Requisitos:**
- .NET Runtime 9.0 o superior
- SQL Server (192.168.1.160:1433 o actualizar connection string)

**Opciones de Hosting:**

1. **Windows Server / IIS**
   - Instala .NET 9.0 Runtime
   - Copia la carpeta `backend/` al servidor
   - Configura IIS Application Pool para .NET Core
   - Actualiza `appsettings.json` con la connection string correcta
   - Ejecuta como aplicación IIS

2. **Azure App Service**
   - Crea un App Service con runtime .NET 9.0
   - Sube la carpeta `backend/` mediante FTP, GitHub Actions o Azure CLI
   - Configura la connection string en Application Settings

3. **Linux Server (Ubuntu/Debian)**
   - Instala .NET Runtime: `sudo apt install dotnet-runtime-9.0`
   - Copia la carpeta `backend/` al servidor
   - Ejecuta: `dotnet SoftSportAPI.dll`
   - Configura como servicio systemd para inicio automático

4. **Docker**
   - Crea un Dockerfile basado en `mcr.microsoft.com/dotnet/aspnet:9.0`
   - Copia los archivos de `backend/`
   - Expone el puerto 5081 (o el configurado)

**Ejecutar manualmente:**
```bash
cd backend
dotnet SoftSportAPI.dll
```

## ⚙️ Configuración Requerida

### 1. Connection String de Base de Datos

Edita `backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=Sys_Academia;User Id=sa;Password=TU_PASSWORD;TrustServerCertificate=True"
  }
}
```

### 2. CORS (si frontend y backend están en dominios diferentes)

El backend ya tiene configurado CORS para:
- http://localhost:3000
- http://localhost:5173

**Actualizar en producción:**

Edita `backend/Program.cs` y agrega tu dominio de producción:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
            "https://tu-dominio-frontend.com",
            "http://localhost:3000"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

### 3. API URL en Frontend

Si el backend está en un servidor diferente, actualiza la URL base en:
`frontend/assets/index-*.js` (buscando `http://localhost:5081`)

**Mejor práctica:** Usar variables de entorno en tiempo de build:
- Crea `.env.production` en la raíz del proyecto frontend:
  ```
  VITE_API_URL=https://tu-dominio-backend.com
  ```
- Actualiza `services/api.ts` para usar `import.meta.env.VITE_API_URL`

## 🗄️ Base de Datos

**Scripts SQL:** Revisa la carpeta `migrations/` en el proyecto original

**Ejecutar migraciones:**
```bash
cd migrations
sqlcmd -S tu_servidor -U sa -P tu_password -d Sys_Academia -i init.sql
```

## 📝 Información del Sistema

- **Versión:** 1.0.0
- **Fecha de Build:** 24/01/2026
- **Frontend:** React 19.2.3 + Vite 6.4.1
- **Backend:** .NET 9.0
- **Base de Datos:** SQL Server

## 🔐 Seguridad

Antes de desplegar en producción:

1. ✅ Cambia las credenciales de base de datos
2. ✅ Configura HTTPS/SSL
3. ✅ Actualiza las CORS origins
4. ✅ Cambia las claves JWT (si aplica)
5. ✅ Revisa los logs de errores estén configurados
6. ✅ Deshabilita detalles de excepciones en producción

## 📞 Soporte

Para más información, contacta al equipo de desarrollo de ADHSOFT SPORT.
