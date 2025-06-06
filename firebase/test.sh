#!/bin/bash

LOGIN_PAYLOAD='{"email": "admin@admin.com", "password": "admin123"}'
LOGIN_URL="http://localhost:3001/login"
TARGET_URL="http://localhost:3001/check-permissions"

# Login e extrai o token
TOKEN=$(curl -s -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_PAYLOAD" | jq -r '.user.uid')

echo "TOKEN: $TOKEN"

# Verifica se token foi obtido
if [[ "$TOKEN" == "null" || -z "$TOKEN" ]]; then
  echo "Erro ao obter token."
  exit 1
fi

# Gera o arquivo de targets
cat <<EOF > targets.txt
POST $TARGET_URL
Authorization: Bearer $TOKEN
Content-Type: application/json
@../permissions.json
EOF

# Executa o teste de carga
vegeta attack -rate=10 -duration=10s -targets=targets.txt -name=firebase | vegeta plot > reportx100.html
vegeta attack -rate=100 -duration=10s -targets=targets.txt -name=firebase | vegeta plot > reportx1000.html
vegeta attack -rate=1000 -duration=10s -targets=targets.txt -name=firebase | vegeta plot > reportx10000.html
