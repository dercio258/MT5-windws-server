@echo off
REM ========================================================
REM Script de Instalação do TorexJournal MT5 Worker Service
REM Utilizando NSSM (Non-Sucking Service Manager)
REM ========================================================

SET SERVICE_NAME=TorexMT5Worker
SET WORKER_DIR=%~dp0..
SET PYTHON_EXE=%WORKER_DIR%\venv\Scripts\python.exe
SET MAIN_SCRIPT=%WORKER_DIR%\main.py

echo Instalando %SERVICE_NAME%...

nssm install %SERVICE_NAME% "%PYTHON_EXE%" "%MAIN_SCRIPT%"
nssm set %SERVICE_NAME% AppDirectory "%WORKER_DIR%"
nssm set %SERVICE_NAME% DisplayName "TorexJournal MT5 Worker Node"
nssm set %SERVICE_NAME% Description "Servico de sincronizacao distribuida do MetaTrader 5 para o Torex Journal"
nssm set %SERVICE_NAME% Start SERVICE_AUTO_START
nssm set %SERVICE_NAME% AppStdout "%WORKER_DIR%\data\logs\service_stdout.log"
nssm set %SERVICE_NAME% AppStderr "%WORKER_DIR%\data\logs\service_stderr.log"
nssm set %SERVICE_NAME% AppRestartDelay 5000

echo Servico configurado com sucesso!
echo Para iniciar: net start %SERVICE_NAME%
pause
