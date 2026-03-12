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
echo -e "${BLUE}🌍 Conectando ao Cloudflare...${NC}"
cloudflared tunnel --url http://localhost:3000 > tunnel.log 2>&1 &

# 3. Loop de captura do Link
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

# 4. Sincronização Automática com GitHub (AGORA TOTAL)
if [ -n "$URL" ]; then
    echo -e "\n${BLUE}📤 Sincronizando tudo com o GitHub...${NC}"
    
    # Adiciona TUDO que foi alterado
    git add .
    
    # Só tenta o commit se houver algo novo de fato
    if ! git diff-index --quiet HEAD; then
        git commit -m "Auto-update: $(date +'%d/%m/%Y %H:%M') - Link: $URL"
        git push origin main --force
        echo -e "${GREEN}✅ GitHub Atualizado!${NC}"
    else
        echo -e "${BLUE}ℹ️ Nenhuma alteração detectada para backup.${NC}"
    fi
fi

if [ -z "$URL" ]; then
    echo -e "\n${RED}❌ Falha ao capturar link.${NC}"
fi

# 5. Iniciar Servidor
echo -e "${GREEN}🚀 Subindo Servidor...${NC}"
node server.js
