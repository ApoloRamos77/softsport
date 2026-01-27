# Configuración del Webhook de Easypanel

Este archivo contiene instrucciones para configurar el despliegue automático desde GitHub a Easypanel.

## Opción 1: GitHub Actions (Recomendado)

1. En Easypanel, ve a tu servicio **web**
2. Ve a **Settings** > **Git** 
3. Activa **"Auto Deploy"** para que se reconstruya automáticamente cuando detecte cambios en la rama `main`

## Opción 2: Webhook Manual

1. En Easypanel:
   - Ve a tu servicio **web**
   - Ve a **Settings** > **Webhooks** 
   - Copia la URL del webhook (algo como: `https://easypanel.host/api/deploy/webhook/xxx`)

2. Crea un archivo `.easypanel-webhook` en la raíz del proyecto:
   ```bash
   echo "https://easypanel.host/api/deploy/webhook/xxx" > .easypanel-webhook
   ```

3. Agrega `.easypanel-webhook` al `.gitignore`:
   ```bash
   echo ".easypanel-webhook" >> .gitignore
   ```

## Uso del Script de Despliegue

### Despliegue básico:
```powershell
.\deploy-frontend.ps1
```

### Despliegue con mensaje personalizado:
```powershell
.\deploy-frontend.ps1 "Fix: Corregir estilos del login"
```

## Opción 3: GitHub Webhook (Automático)

1. En Easypanel, obtén la URL del webhook de deploy

2. En GitHub:
   - Ve a tu repositorio
   - Settings > Webhooks > Add webhook
   - Payload URL: Pega la URL del webhook de Easypanel
   - Content type: `application/json`
   - Events: Selecciona "Just the push event"
   - Active: ✓

3. Guarda el webhook

Ahora cada `git push` reconstruirá automáticamente el servicio en Easypanel.

## Verificar Despliegue

Después de desplegar:
1. Ve a Easypanel > Servicio **web** > **Logs**
2. Verifica que el build se complete sin errores
3. Abre https://softsport77-web.scuiaw.easypanel.host
4. Presiona Ctrl+Shift+R para forzar recarga sin caché

## Troubleshooting

**Si los cambios no se reflejan:**
1. Limpia el caché del navegador: Ctrl+Shift+R
2. En Easypanel, haz click en "Clear Build Cache"
3. Rebuild manual del servicio
4. Verifica en Network (F12) que el archivo JS sea el más reciente

**Si el webhook falla:**
- Verifica que la URL sea correcta
- Comprueba que el servicio en Easypanel esté activo
- Revisa los logs en Easypanel
