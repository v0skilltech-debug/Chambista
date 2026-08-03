@echo off
echo Iniciando Frontend (Next.js)...
start cmd /k "npm run dev"

echo Instalando dependencias del Backend e iniciando FastAPI...
start cmd /k "cd backend && python -m venv venv && call venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn main:app --reload"

echo Servidores iniciados.
