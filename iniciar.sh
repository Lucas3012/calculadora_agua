#!/bin/bash
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🌀 Iniciando Lucas Omni & Sincronizando GitHub...${NC}"

# 1. Limpar processos antigos
fuser -k 3000/tcp 2>/dev/null
pkill -9 node cloudflared 2>/dev/null
sleep 2

# 2. Iniciar Túnel Cloudflare
cloudflared tunnel --url http://localhost:3000 > tunnel.log 2>&1 &

# 3. Capturar o novo link
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
    # 4. ATUALIZAR O LINK NOS ARQUIVOS DE FRONTEND
    # Isso procura por uma linha que contenha 'const API_URL' ou similar e troca o link
    echo -e "${BLUE}📝 Atualizando link nos arquivos de frontend...${NC}"
    
    # Se você usa uma variável API_URL no script.js ou index.html:
    sed -i "s|const API_URL = '.*'|const API_URL = '$URL'|g" public/script.js 2>/dev/null
    sed -i "s|const API_URL = '.*'|const API_URL = '$URL'|g" public/index.html 2>/dev/null

    # 5. SUBIR PARA O GITHUB
    echo -e "${BLUE}📤 Subindo para GitHub Pages...${NC}"
    git add .
    git commit -m "Auto-update API Link: $URL"
    git push origin main --force
    echo -e "${GREEN}🚀 GitHub Atualizado! Agora o link do GitHub Pages vai funcionar.${NC}"
else
    echo -e "${RED}❌ Falha ao gerar link do Cloudflare.${NC}"
fi

# 6. Iniciar o Servidor Node
echo -e "${GREEN}💻 Servidor rodando localmente...${NC}"
node server.js
