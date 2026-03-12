#!/bin/bash
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🌀 Iniciando Lucas Omni & Sincronizando GitHub...${NC}"

# 1. Limpeza
fuser -k 3000/tcp 2>/dev/null
pkill -9 node cloudflared 2>/dev/null
sleep 2

# 2. Iniciar Túnel
cloudflared tunnel --url http://localhost:3000 > tunnel.log 2>&1 &

# 3. Capturar Link
for i in {1..15}; do
    URL=$(grep -o 'https://[-a-z0-9.]*trycloudflare.com' tunnel.log | head -n 1)
    if [ -n "$URL" ]; then
        echo -e "${GREEN}✅ NOVO LINK CLOUDFLARE: $URL${NC}"
        break
    fi
    echo -ne "${BLUE}⏳ Gerando link... ($i/15)\r${NC}"
    sleep 2
done

if [ -n "$URL" ]; then
    # 4. Atualizar link no script.js (agora na raiz)
    echo -e "${BLUE}📝 Atualizando script.js com o novo link...${NC}"
    sed -i "s|const API_URL = '.*'|const API_URL = '$URL'|g" script.js 2>/dev/null

    # 5. Enviar para o GitHub
    echo -e "${BLUE}📤 Fazendo push para o GitHub Pages...${NC}"
    git add .
    git commit -m "Auto-deploy: $URL"
    git push origin main --force
    echo -e "${GREEN}🚀 Site atualizado no GitHub! (Aguarde 30s for propagaçao)${NC}"
else
    echo -e "${RED}❌ Falha ao gerar link do Cloudflare.${NC}"
fi

# 6. Rodar Servidor
echo -e "${GREEN}💻 Servidor Node.js em execução...${NC}"
node server.js
