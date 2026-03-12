cat <<'EOF' > cadastrar.sh
#!/bin/bash
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}👥 Gerenciador de Usuários (Múltiplos) - Lucas Omni${NC}"

# Pedir dados
read -p "Novo usuário: " USERNAME
read -p "Nova senha: " PASSWORD

if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
    echo -e "${RED}❌ Erro: Usuário e senha não podem ser vazios!${NC}"
    exit 1
fi

# Código Node.js para manipular o JSON com segurança
node -e "
const fs = require('fs');
const path = 'data/usuarios.json';

// Garante que a pasta existe
if (!fs.existsSync('data')) fs.mkdirSync('data');

let usuarios = [];
if (fs.existsSync(path)) {
    try {
        usuarios = JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (e) {
        usuarios = [];
    }
}

// Verifica se o usuário já existe
if (usuarios.some(u => u.usuario === '$USERNAME')) {
    console.log('${RED}⚠️ O usuário \"$USERNAME\" já existe!${NC}');
    process.exit(1);
}

// Cria novo usuário com ID incremental
const novoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
usuarios.push({ id: novoId, usuario: '$USERNAME', senha: '$PASSWORD' });

fs.writeFileSync(path, JSON.stringify(usuarios, null, 2));
console.log('${GREEN}✅ Usuário \"$USERNAME\" (ID: ' + novoId + ') adicionado com sucesso!${NC}');
"

# Sincroniza o banco de dados com o GitHub após o cadastro
echo -e "${BLUE}📤 Sincronizando banco de dados com GitHub...${NC}"
git add data/usuarios.json
git commit -m "Novo usuário cadastrado: $USERNAME"
git push origin main --force
EOF

chmod +x cadastrar.sh
