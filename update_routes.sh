#!/bin/bash

# Diretório base
BASE_DIR="d:/Projeto/Ofir-Fin/src/app/api"

# Função para atualizar rotas
update_route() {
    local file="$1"
    echo "Processando $file"
    
    # Adicionar export const dynamic = 'force-dynamic' se não existir
    if ! grep -q "export const dynamic = 'force-dynamic'" "$file"; then
        sed -i '1iexport const dynamic = '"'"'force-dynamic'"'"';' "$file"
    fi
    
    # Remover qualquer config antigo
    sed -i '/export const config = {/,/^}/d' "$file"
}

# Encontrar todos os arquivos route.ts
find "$BASE_DIR" -name "route.ts" | while read -r file; do
    update_route "$file"
done

echo "Atualização concluída!"
