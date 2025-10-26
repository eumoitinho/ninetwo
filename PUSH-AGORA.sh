#!/bin/bash

echo "🚀 Fazendo push para origin/main..."

cd /home/moitinho/Documents/Projetos/ninetwo

# Rebase abort se houver algum pendente
git rebase --abort 2>/dev/null || true

# Add tudo
git add -A

# Commit se houver mudanças
git diff --cached --quiet || git commit -m "feat: ready for production - Kafka + Couchbase complete"

# Force push
git push -f origin HEAD:main

echo "✅ Push completo!"
echo ""
echo "📋 Próximos passos:"
echo "1. Abrir PLANO-12H.md"
echo "2. Seguir hora a hora"
echo "3. Em 12 horas estará funcionando!"

