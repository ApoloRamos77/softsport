# ====================================================================
# GUÍA RÁPIDA: Desplegar en Easypanel SIN Docker Local
# ====================================================================

## ✅ Método Recomendado: Usar Git Deploy

Easypanel puede construir las imágenes Docker automáticamente desde GitHub/GitLab.

### Paso 1: Preparar Repositorio Git

1. Inicializa Git si no lo has hecho:
```bash
git init
git add .
git commit -m "Preparar para despliegue en Easypanel"
```

2. Sube a GitHub o GitLab:
```bash
git remote add origin https://github.com/tu-usuario/softsport.git
git push -u origin main
```

### Paso 2: Conectar con Easypanel

1. Ve a https://easypanel.io y crea una cuenta
2. Crea un nuevo **Proyecto**: "ADHSOFT-SPORT"
3. Conecta tu repositorio de GitHub/GitLab

### Paso 3: Configurar Backend

1. En Easypanel, click en **"Add Service"**
2. Selecciona **"App"**
3. Configuración:
   - **Name:** softsport-backend
   - **Source:** GitHub/GitLab
   - **Repository:** tu-usuario/softsport
   - **Branch:** main
   - **Dockerfile Path:** publish/backend/Dockerfile
   - **Build Context:** publish/backend
   - **Port:** 5081

4. **Variables de Entorno:**
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:5081
   ConnectionStrings__DefaultConnection=Server=TU_SERVIDOR;Database=Sys_Academia;User Id=sa;Password=TU_PASSWORD;TrustServerCertificate=True;MultipleActiveResultSets=true
   ```

5. **Domain:** Asigna un dominio (ej: api.tudominio.com)

6. Click en **"Deploy"**

### Paso 4: Configurar Frontend

1. Click en **"Add Service"**
2. Selecciona **"App"**
3. Configuración:
   - **Name:** softsport-frontend
   - **Source:** GitHub/GitLab
   - **Repository:** tu-usuario/softsport
   - **Branch:** main
   - **Dockerfile Path:** publish/frontend/Dockerfile
   - **Build Context:** publish/frontend
   - **Port:** 80

4. **Domain:** Asigna un dominio (ej: app.tudominio.com)

5. Click en **"Deploy"**

## 🔄 Alternativa: Subir Archivos Manualmente

Si no quieres usar Git:

### Backend:

1. Comprime la carpeta `publish/backend/` en un ZIP
2. En Easypanel, crea un servicio tipo **"App"**
3. Sube el ZIP
4. Especifica el Dockerfile y configura las variables de entorno
5. Despliega

### Frontend:

1. Comprime la carpeta `publish/frontend/` en un ZIP
2. En Easypanel, crea un servicio tipo **"App"**
3. Sube el ZIP
4. Especifica el Dockerfile
5. Despliega

## 📋 Configuración de Base de Datos

### Opción 1: SQL Server Externo (Recomendado si ya tienes uno)

1. Asegúrate de que tu SQL Server (192.168.1.160) sea accesible desde internet
2. Configura port forwarding en tu router: Puerto 1433
3. Usa la IP pública de tu servidor en el connection string
4. **IMPORTANTE:** Configura el firewall de Windows para permitir conexiones externas

Connection string:
```
Server=TU_IP_PUBLICA,1433;Database=Sys_Academia;User Id=sa;Password=Mt$q12o15;TrustServerCertificate=True;MultipleActiveResultSets=true
```

### Opción 2: SQL Server en Easypanel

1. En Easypanel, agrega un servicio **"Database"** → **SQL Server**
2. Anota el host interno (ej: `softsport-db`)
3. Actualiza el connection string:
```
Server=softsport-db;Database=Sys_Academia;User Id=sa;Password=TU_PASSWORD_SEGURO;TrustServerCertificate=True;MultipleActiveResultSets=true
```

4. Ejecuta las migraciones SQL:
   - Sube los archivos de `migrations/` al contenedor
   - Ejecuta los scripts SQL

### Opción 3: Túnel con ngrok (Para desarrollo/pruebas)

1. Instala ngrok: https://ngrok.com/
2. Ejecuta:
```bash
ngrok tcp 1433
```
3. Usa la URL de ngrok en el connection string

## 🔧 Actualizar CORS

Después de obtener tus dominios de Easypanel, actualiza `appsettings.json`:

```json
{
  "AllowedOrigins": [
    "https://app.tudominio.com",
    "https://www.tudominio.com"
  ]
}
```

Y vuelve a desplegar.

## 🧪 Probar el Despliegue

1. **Backend:** https://api.tudominio.com/swagger
2. **Frontend:** https://app.tudominio.com
3. **Login:**
   - Usuario: admin
   - Password: admin123

## ⚠️ IMPORTANTE: Seguridad

Antes de usar en producción:

✅ Cambia la contraseña de la base de datos
✅ Cambia la contraseña del usuario admin
✅ Usa HTTPS (Easypanel lo hace automático)
✅ No expongas tu SQL Server local directamente a internet sin un firewall robusto
✅ Considera usar una VPN o túnel seguro para la base de datos

## 📞 ¿Necesitas Ayuda?

- Documentación Easypanel: https://easypanel.io/docs
- Soporte: https://easypanel.io/discord
- Guía completa: EASYPANEL_DEPLOY.md

## 🚀 ¡Listo!

Una vez desplegado, tu aplicación estará disponible 24/7 en los dominios que configuraste.
