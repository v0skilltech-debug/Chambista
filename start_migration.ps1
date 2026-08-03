# start_migration.ps1
Write-Host "Iniciando la migración y aplicando cambios en la base de datos..." -ForegroundColor Cyan

# Variables
$dbPath = ".\backend\chambista.db"

# 1. Eliminar la base de datos actual para que SQLAlchemy la recree con los 5 pasos
if (Test-Path $dbPath) {
    Write-Host "Eliminando la base de datos antigua (chambista.db)..." -ForegroundColor Yellow
    Remove-Item -Path $dbPath -Force
    Write-Host "Base de datos eliminada con éxito." -ForegroundColor Green
} else {
    Write-Host "No se encontró chambista.db anterior, se creará una nueva." -ForegroundColor Green
}

# 2. Asegurarse de que las dependencias de Python estén instaladas
Write-Host "Actualizando dependencias de Python..." -ForegroundColor Cyan
# Asumiendo que venv está activado o se puede ejecutar pip
if (Test-Path ".\backend\venv\Scripts\pip.exe") {
    & ".\backend\venv\Scripts\pip.exe" install -r .\backend\requirements.txt
} else {
    pip install -r .\backend\requirements.txt
}

# 3. Levantar los servidores
Write-Host "¡Migración completada! Levantando servidores..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd backend && .\venv\Scripts\activate && uvicorn main:app --reload" -Title "FastAPI Backend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -Title "Next.js Frontend"

Write-Host "Servidores iniciados en ventanas separadas." -ForegroundColor Magenta
