#!/bin/bash

LOGIN_PAYLOAD='{"username": "admin@admin.com", "password": "oUSH3*hQ."}'
LOGIN_URL="http://localhost:3001/login"
TARGET_URL="http://localhost:3001/check-permissions"

# Login e extrai o userId
USERID=$(curl -s -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_PAYLOAD" | jq -r '.userId')

echo "USERID: $USERID"

if [[ "$USERID" == "null" || -z "$USERID" ]]; then
  echo "Erro ao obter userId."
  exit 1
fi

cat <<EOF > targets.txt
POST $TARGET_URL
Authorization: Bearer $USERID
Content-Type: application/json
@../permissions.json
EOF

vegeta attack -rate=10 -duration=10s -targets=targets.txt -name=aws | vegeta plot > reportx100.html
vegeta attack -rate=100 -duration=10s -targets=targets.txt -name=aws | vegeta plot > reportx1000.html
vegeta attack -rate=1000 -duration=10s -targets=targets.txt -name=aws | vegeta plot > reportx10000.html
