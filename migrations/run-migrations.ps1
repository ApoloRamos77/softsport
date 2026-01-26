# Ejecuta migrations/init.sql usando sqlcmd y la configuración de webconfig.json
# Uso: Ejecutar desde PowerShell en la raíz del proyecto

$cfgPath = Join-Path -Path (Get-Location) -ChildPath "webconfig.json"
if (-not (Test-Path $cfgPath)) {
    Write-Error "No se encontró webconfig.json en la carpeta actual. Asegúrate de ejecutar desde la raíz del proyecto."
    exit 1
}

$config = Get-Content $cfgPath -Raw | ConvertFrom-Json
$db = $config.db
if (-not $db) { Write-Error "webconfig.json no contiene la sección 'db'"; exit 1 }

$server = "$($db.server),$($db.port)"
$user = $db.user
$pass = $db.password

$migration = Join-Path -Path (Get-Location) -ChildPath "migrations\init.sql"
if (-not (Test-Path $migration)) { Write-Error "No se encontró migrations\init.sql"; exit 1 }

# Comprueba si sqlcmd está disponible
$sqlcmd = Get-Command sqlcmd -ErrorAction SilentlyContinue
if (-not $sqlcmd) {
    Write-Error "sqlcmd no está en PATH. Instala las herramientas de cliente de SQL Server o añade sqlcmd al PATH."
    exit 1
}

Write-Host "Ejecutando migración contra $server ..."

# Ejecutar sqlcmd
$sqlcmdArgs = @("-S", $server, "-U", $user, "-P", $pass, "-i", $migration)
$proc = Start-Process -FilePath $sqlcmd.Path -ArgumentList $sqlcmdArgs -NoNewWindow -Wait -PassThru
if ($proc.ExitCode -ne 0) {
    Write-Error "sqlcmd finalizó con código $($proc.ExitCode). Revisa la salida de sqlcmd para más detalles."
    exit $proc.ExitCode
}

Write-Host "Migración ejecutada correctamente.";
