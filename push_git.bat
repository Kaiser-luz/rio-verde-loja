@echo off
echo 🔧 Corrigindo dependencias do React e Next.js...

:: 1. Remove instalações antigas (equivalente a rm -rf)
if exist node_modules (
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del /f /q package-lock.json
)

:: 2. Instala versoes compativeis e seguras
:: Atualiza para Next.js 15.1.7 (corrige vulnerabilidade) e React 19 RC compativel
echo 📦 Instalando dependencias corretas...
call npm install react@19.0.0-rc-66855b96-20241106 react-dom@19.0.0-rc-66855b96-20241106 next@15.1.7

:: 3. Instala o resto das dependencias
call npm install

echo 🔄 Sincronizando Prisma...
call npx prisma generate

echo 📦 Adicionando arquivos ao Git...
git add .

echo 📝 Criando commit...
git commit -m "Fix: PROdutos vulnerabilidades nas dependencias do React e Next.js"

echo 🚀 Enviando para o GitHub...
git push

echo ✅ Sucesso! Tudo salvo na nuvem.
pause