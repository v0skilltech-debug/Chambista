@echo off
setlocal
chcp 65001 >nul
title Chambista Demo - Visor Unificado de Interfaces

echo ==============================================================================
echo       CHAMBISTA DEMO -- RECOPILADOR Y VISOR UNIFICADO DE INTERFACES
echo ==============================================================================
echo.

set "SCRIPT_DIR=%~dp0"

if exist "%SCRIPT_DIR%html\chambista-demo\server.mjs" goto found_root
if exist "%SCRIPT_DIR%server.mjs" goto found_local

echo [ERROR] No se encontro la carpeta del producto de prueba: html/chambista-demo
echo Asegurate de ejecutar este archivo dentro de la carpeta del proyecto.
pause
exit /b 1

:found_root
cd /d "%SCRIPT_DIR%html\chambista-demo"
goto run_checks

:found_local
cd /d "%SCRIPT_DIR%"
goto run_checks

:run_checks
echo [1/3] Verificando entorno de ejecucion...
where node >nul 2>&1
if errorlevel 1 goto no_node

echo       * Node.js detectado correctamente.
echo.
echo [2/3] Agrupando todos los archivos HTML del producto de prueba...
if exist "scripts\generar-todas-interfaces.mjs" (
    node "scripts\generar-todas-interfaces.mjs"
) else (
    echo [INFO] Utilizando archivo todas-las-interfaces.html existente.
)

echo.
echo [3/3] Iniciando servidor local para pruebas de frontend...
echo       * URL del visor: http://127.0.0.1:8080/todas-las-interfaces.html
echo.
echo ------------------------------------------------------------------------------
echo   TODAS LAS INTERFACES LISTAS PARA PROBAR:
echo   - Modo Cascada: Mira las 22 pantallas en una sola pagina con scroll continuo.
echo   - Modo Interactivo: Prueba cada pantalla en simulador de movil, tablet o PC.
echo   - Modo Mosaico: Compara todos los frontends lado a lado.
echo ------------------------------------------------------------------------------
echo   Para cerrar el servidor, presiona [Ctrl + C] en esta ventana.
echo ==============================================================================
echo.

rem Abrir en el navegador predeterminado
start "" "http://127.0.0.1:8080/todas-las-interfaces.html"

rem Iniciar servidor estatico de prueba
node server.mjs
exit /b 0

:no_node
echo [AVISO] Node.js no esta disponible en el PATH del sistema.
echo Abriendo 'todas-las-interfaces.html' directamente en tu navegador...
start "" "todas-las-interfaces.html"
echo.
echo Se abrio la pagina unificada en tu navegador predeterminado.
pause
exit /b 0
