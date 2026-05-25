@echo off
echo ===================================================
echo   Subindo o site da Verbo AI para o GitHub
echo ===================================================
echo.
set /p repo="Cole o link HTTPS do seu repositorio do GitHub: "
echo.
echo Conectando ao repositorio remoto...
git remote remove origin >nul 2>&1
git remote add origin %repo%
echo.
echo Enviando arquivos...
git push -u origin main
echo.
echo ===================================================
echo   Processo concluido! 
echo   Se o Git solicitou login, certifique-se de 
echo   que o envio foi bem-sucedido acima.
echo ===================================================
pause
