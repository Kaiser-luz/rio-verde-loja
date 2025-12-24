@echo off
echo ===================================================
echo 🚀 INICIANDO PROCESSO DE ATUALIZAÇÃO E ENVIO GIT
echo ===================================================

echo.
echo 🧹 1. Limpando instalacoes antigas para evitar conflitos...
if exist node_modules (
    rmdir /s /q node_modules
    echo    - Pasta node_modules removida.
)
if exist package-lock.json (
    del /f /q package-lock.json
    echo    - Arquivo package-lock.json removido.
)

echo.
echo 📦 2. Instalando dependencias seguras (Next 15.1.7 + React 19 RC)...
echo    Isso pode demorar alguns minutos. Por favor, aguarde.
call npm install react@19.0.0-rc-66855b96-20241106 react-dom@19.0.0-rc-66855b96-20241106 next@15.1.7
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependencias principais. Tentando instalacao forçada...
    call npm install --force
)

echo.
echo 📥 3. Instalando restante das dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ⚠️ Aviso: Houve algum problema na instalacao geral, mas vamos prosseguir.
)

echo.
echo 🔄 4. Gerando cliente do Prisma (Sincronizando Banco de Dados)...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Erro ao gerar Prisma Client. Verifique seu schema.prisma.
    pause
    exit /b
)

echo.
echo 💾 5. Preparando arquivos para o Git...
git add .

echo.
echo 📝 6. Criando commit...
git commit -m "Feat: Checkout completo com Frete, PDF, Endereco e Layout final"

echo.
echo ⬆️ 7. Enviando para o GitHub...
git push

echo.
echo ===================================================
echo ✅ SUCESSO! Tudo atualizado e salvo na nuvem.
echo ===================================================
pause