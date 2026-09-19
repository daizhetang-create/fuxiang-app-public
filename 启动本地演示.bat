@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo 首次启动，正在安装依赖...
  call npm.cmd install
)
start "" http://127.0.0.1:4173
call npm.cmd run dev
pause
