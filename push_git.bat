@echo off
echo 🔧 Corrigindo dependencias do React e Next.js...

:: 1. Remove instalações antigas (equivalente a rm -rf)
if exist node_modules (
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del /f /q package-lock.json
)

:: 2. Instala versoes compativeis
echo 📦 Instalando dependencias corretas...
call npm install react@19.0.0-rc-de68d2f4-20241204 react-dom@19.0.0-rc-de68d2f4-20241204 next@15.1.7

:: 3. Instala o resto
call npm install

echo 🔄 Sincronizando Prisma...
call npx prisma generate

echo 📦 Adicionando arquivos ao Git...
git add .

echo 📝 Criando commit...
git commit -m "Fix: Atualizacao de dependencias (Next 15.1.7 + React 19 RC) e implementacao de frete/PDF"

echo 🚀 Enviando para o GitHub...
git push

echo ✅ Sucesso! Tudo salvo na nuvem.
pause