#!/bin/bash
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}👤 Gerenciador de Usuários - Lucas Omni${NC}"

# Pedir novos dados
read -p "Digite o novo nome de usuário: " NOVO_USER
read -p "Digite a nova senha: " NOVA_SENHA

# Caminho do arquivo de banco de dados
DB_FILE="data/usuarios.json"

# Criar a pasta data se não existir
mkdir -p data

# Criar ou atualizar o arquivo JSON com o novo usuário
# Nota: Aqui estamos definindo o ID como 1 para simplificar
echo "[{\"id\": 1, \"usuario\": \"$NOVO_USER\", \"senha\": \"$NOVA_SENHA\"}]" > "$DB_FILE"

echo -e "${GREEN}✅ Usuário '$NOVO_USER' cadastrado com sucesso!${NC}"
echo -e "${BLUE}Dica: Reinicie o servidor com ./iniciar.sh para garantir a leitura.${NC}"
