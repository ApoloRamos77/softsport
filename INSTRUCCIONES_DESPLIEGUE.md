# ADHSOFT SPORT - Instrucciones de Despliegue en Easypanel

## Estado Actual ✅

El proyecto ha sido preparado y está listo para desplegar en Easypanel:

- ✅ Repositorio Git inicializado
- ✅ Código comprometido
- ✅ Dockerfiles creados (frontend y backend)
- ✅ Configuraciones de nginx y CORS
- ✅ Variables de entorno documentadas
- ✅ Archivos de build listos en carpeta `publish/`

## Próximos Pasos

### Opción 1: Despliegue con GitHub/GitLab (Recomendado)

1. **Subir a GitHub/GitLab**
   ```bash
   # Crear repositorio en GitHub: https://github.com/new
   # Luego ejecutar:
   git remote add origin https://github.com/TU-USUARIO/softsport.git
   git branch -M main
   git push -u origin main
   ```

2. **Configurar en Easypanel**
   - Ir a https://easypanel.io
   - Crear cuenta si no la tienes
   - Crear nuevo proyecto: "ADHSOFT-SPORT"
   - Conectar tu repositorio de GitHub

3. **Agregar servicio Backend**
   - Type: App
   - Source: GitHub/GitLab
   - Repository: tu-usuario/softsport
   - Branch: main
   - Dockerfile: `publish/backend/Dockerfile`
   - Build context: `publish/backend`
   - Port: 5081
   
   **Variables de entorno:**
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:5081
   ConnectionStrings__DefaultConnection=Server=TU_SERVIDOR;Database=Sys_Academia;User Id=sa;Password=TU_PASSWORD;TrustServerCertificate=True;MultipleActiveResultSets=true
   ```

4. **Agregar servicio Frontend**
   - Type: App
   - Source: GitHub/GitLab
   - Repository: tu-usuario/softsport
   - Branch: main
   - Dockerfile: `publish/frontend/Dockerfile`
   - Build context: `publish/frontend`
   - Port: 80

5. **Asignar Dominios**
   - Backend: api.tudominio.com → 5081
   - Frontend: app.tudominio.com → 80

### Opción 2: Despliegue Manual (Sin GitHub)

1. **Comprimir carpetas**
   ```bash
   # En PowerShell:
   Compress-Archive -Path publish\backend\* -DestinationPath backend.zip
   Compress-Archive -Path publish\frontend\* -DestinationPath frontend.zip
   ```

2. **Subir a Easypanel**
   - Crear servicios manualmente
   - Subir los archivos ZIP
   - Configurar variables de entorno
   - Asignar dominios

### Opción 3: Usar Script Automático

```bash
cd publish
.\prepare-easypanel.ps1
```

Esto creará un archivo `softsport-easypanel.zip` listo para subir.

## Configuración de Base de Datos

### Opción A: SQL Server Externo (Tu servidor actual)

1. **Configurar acceso remoto**
   - Habilitar conexiones TCP/IP en SQL Server
   - Configurar firewall: Puerto 1433
   - Obtener IP pública del servidor

2. **Connection String**
   ```
   Server=TU_IP_PUBLICA,1433;Database=Sys_Academia;User Id=sa;Password=Mt$q12o15;TrustServerCertificate=True;MultipleActiveResultSets=true
   ```

### Opción B: SQL Server en Easypanel

1. Crear servicio Database → SQL Server
2. Ejecutar migraciones desde carpeta `migrations/`
3. Usar host interno de Easypanel

### Opción C: Túnel Seguro (Desarrollo)

```bash
# Instalar ngrok: https://ngrok.com/
ngrok tcp 1433
# Usar la URL generada en el connection string
```

## Archivos Importantes

- `publish/GUIA_RAPIDA_EASYPANEL.md` - Guía detallada paso a paso
- `publish/EASYPANEL_DEPLOY.md` - Documentación completa
- `publish/.env.example` - Variables de entorno de ejemplo
- `publish/docker-compose.yml` - Para pruebas locales
- `.gitignore` - Archivos excluidos de Git

## Probar Localmente con Docker

```bash
cd publish
docker-compose up -d

# Acceder:
# Frontend: http://localhost:3000
# Backend: http://localhost:5081/swagger
```

## Checklist de Seguridad

Antes de producción:

- [ ] Cambiar password de base de datos
- [ ] Actualizar dominios en CORS (appsettings.json)
- [ ] Cambiar password del usuario admin
- [ ] Configurar HTTPS (Easypanel lo hace automático)
- [ ] Configurar backups de base de datos
- [ ] Revisar logs de errores

## URLs de Acceso Post-Despliegue

- Frontend: https://app.tudominio.com
- Backend API: https://api.tudominio.com/swagger
- Login: admin / admin123

## Soporte y Documentación

- Documentación Easypanel: https://easypanel.io/docs
- Discord Easypanel: https://easypanel.io/discord
- Archivos del proyecto en: `publish/`

## Notas Importantes

⚠️ **No subas contraseñas a Git**
- Las contraseñas en los archivos actuales son de desarrollo
- Usa variables de entorno en Easypanel para producción

⚠️ **Actualiza la URL del API en el Frontend**
- Antes de desplegar, edita la URL en los archivos JS compilados
- O mejor: reconstruye el frontend con la URL de producción

⚠️ **Migraciones de Base de Datos**
- Asegúrate de ejecutar todos los scripts de `migrations/`
- Especialmente `init.sql` y `add-default-user.sql`

## ¿Listo para Desplegar?

1. Lee `publish/GUIA_RAPIDA_EASYPANEL.md`
2. Elige tu método de despliegue (GitHub, manual, o script)
3. Configura las variables de entorno
4. ¡Despliega!

---

**Fecha:** Enero 2026
**Versión:** 1.0.0
**Sistema:** ADHSOFT SPORT
