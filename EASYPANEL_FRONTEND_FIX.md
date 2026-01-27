# Configuración del Frontend en Easypanel

## El problema
El servicio web se está apagando porque Easypanel no está configurado correctamente para servir archivos estáticos con Nginx.

## Solución: Configurar el servicio correctamente en Easypanel

### Opción 1: Servicio Docker (RECOMENDADO)

1. En Easypanel, ve al servicio **web**
2. Click en **Settings** o **Configuración**
3. En **Source**, asegúrate de tener:
   - **Repository**: `ApoloRamos77/softsport`
   - **Branch**: `main`
   - **Build Path**: `publish/frontend`

4. En **Build Configuration**:
   - **Dockerfile Path**: `Dockerfile` (debe estar en publish/frontend)
   - **Build Context**: `.` (punto, significa directorio actual)

5. En **Deploy**:
   - **Port**: `80`
   - **Health Check Path**: `/` (opcional)

6. Click en **Save** y luego **Rebuild**

### Opción 2: Servicio Estático (MÁS SIMPLE)

1. En Easypanel, **elimina el servicio actual "web"**

2. Crea un **NUEVO servicio**:
   - Tipo: **Static Site** o **App → Nginx**
   - Nombre: `web`

3. Configuración:
   - **Repository**: `ApoloRamos77/softsport`
   - **Branch**: `main`
   - **Root Directory**: `publish/frontend`
   - **Build Command**: *(dejar vacío - ya está compilado)*
   - **Output Directory**: `.` (punto)

4. En **Domains**, configura:
   - softsport77-web.scuiaw.easypanel.host

5. Click en **Deploy**

### Opción 3: Usar Netlify/Vercel (ALTERNATIVA)

Si Easypanel sigue dando problemas, puedes usar Netlify o Vercel para el frontend:

**Netlify:**
1. Ve a https://netlify.com
2. New site from Git
3. Conecta tu repositorio
4. Build settings:
   - Base directory: `publish/frontend`
   - Build command: *(vacío)*
   - Publish directory: `.`

**Vercel:**
1. Ve a https://vercel.com
2. Import Git Repository
3. Root Directory: `publish/frontend`
4. Framework Preset: Other
5. Build Command: *(vacío)*
6. Output Directory: `.`

### Verificar que funciona

Después de configurar correctamente:
1. Los logs deben mostrar: `nginx: configuration file /etc/nginx/nginx.conf test is successful`
2. El servicio debe mostrar status **Running** (no **Stopped**)
3. La URL debe cargar el login correctamente

### Troubleshooting

**Si sigue sin funcionar:**
```bash
# Verifica que los archivos están en publish/frontend
ls publish/frontend/
# Debe mostrar: index.html, assets/, custom-adminlte.css, etc.
```

**Verificar Dockerfile:**
```bash
cd publish/frontend
docker build -t test-frontend .
docker run -p 8080:80 test-frontend
# Abre http://localhost:8080
```

## Configuración actual vs correcta

**❌ Incorrecto (lo que puede estar pasando):**
- Build Path: `.` (raíz del proyecto)
- Dockerfile: No encontrado o en lugar incorrecto
- Result: Nginx se inicia pero no encuentra los archivos

**✅ Correcto:**
- Build Path: `publish/frontend`
- Dockerfile: En `publish/frontend/Dockerfile`
- Archivos: En `publish/frontend/`
- Result: Nginx sirve los archivos correctamente
