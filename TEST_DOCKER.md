# Test Local del Frontend

## Probar el Dockerfile localmente

```powershell
# Ir al directorio
cd publish/frontend

# Construir imagen
docker build -t softsport-frontend-test .

# Ejecutar contenedor
docker run -p 8080:80 softsport-frontend-test

# Abrir en navegador
start http://localhost:8080
```

Si funciona localmente pero no en Easypanel, el problema está en la configuración de Easypanel, no en el Dockerfile.

## Ver logs durante el build

```powershell
docker build --no-cache -t softsport-frontend-test . 2>&1 | Tee-Object -FilePath build-logs.txt
```

Esto guardará todos los logs del build en `build-logs.txt` para revisar.

## Verificar que los archivos están en el contenedor

```powershell
# Crear contenedor sin iniciarlo
docker create --name test-container softsport-frontend-test

# Copiar archivos del contenedor
docker cp test-container:/usr/share/nginx/html ./test-html

# Ver archivos
ls ./test-html

# Limpiar
docker rm test-container
```
