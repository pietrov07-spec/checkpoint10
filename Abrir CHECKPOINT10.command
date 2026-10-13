#!/bin/zsh
# Doble clic para ver CHECKPOINT10 en tu navegador. Cierra esta ventana para detenerlo.
cd "$(dirname "$0")"
export PATH="$HOME/.local/node/bin:$PATH"
[ -d node_modules ] || npm install
echo "Preparando CHECKPOINT10…"
npm run build || { echo "La compilación falló. Revisa el mensaje de arriba."; read; exit 1; }
(sleep 2; open "http://127.0.0.1:4173/") &
echo ""
echo "CHECKPOINT10 está en http://127.0.0.1:4173/  —  cierra esta ventana para detenerlo."
npx vite preview --configLoader native --host 127.0.0.1 --port 4173
