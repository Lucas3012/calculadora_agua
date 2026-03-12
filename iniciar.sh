#!/bin/bash
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🌀 Reiniciando Lucas Omni 2026...${NC}"

# 1. Limpeza de processos
fuser -k 3000/tcp 2>/dev/null
pkill -9 node cloudflared 2>/dev/null
sleep 2

# 2. Iniciar Túnel
echo -e "${BLUE}🌍 Conectando aos servidores Cloudflare...${NC}"
cloudflared tunnel --url http://localhost:3000 > tunnel.log 2>&1 &

# 3. Loop de captura (tenta por 15 vezes a cada 2 segundos)
for i in {1..15}; do
    URL=$(grep -o 'https://[-a-z0-9.]*trycloudflare.com' tunnel.log | head -n 1)
    if [ -n "$URL" ]; then
        echo -e "${GREEN}✅ SISTEMA ONLINE NO LINK:${NC}"
        echo -e "${GREEN}👉 $URL${NC}"
        echo "$URL" > ultimo_link.txt
        break
    fi
    echo -ne "${BLUE}⏳ Aguardando conexão... ($i/15)\r${NC}"
    sleep 2
done

if [ -z "$URL" ]; then
    echo -e "\n${RED}❌ Não foi possível capturar o link automaticamente.${NC}"
    echo -e "${RED}Verifique sua conexão ou veja o log com: cat tunnel.log${NC}"
fi

# 4. Iniciar Servidor
echo -e "${GREEN}🚀 Subindo Base de Dados e Servidor...${NC}"
node server.js
