#!/bin/bash

# Script para parar o NineTwo Performance CRM completamente

set -e

echo "🛑 Parando NineTwo Performance CRM..."
echo ""

# ============================================
# 1. PARAR PROCESSOS NODE/YARN
# ============================================
echo "🔪 Matando processos Node.js..."
pkill -9 -f "yarn start" 2>/dev/null || true
pkill -9 -f "node.*ninetwo" 2>/dev/null || true
pkill -9 -f "nx run" 2>/dev/null || true
sleep 2
echo "✅ Processos Node.js parados!"
echo ""

# ============================================
# 2. PARAR CONTAINERS DOCKER (OPCIONAL)
# ============================================
read -p "🐳 Deseja parar os containers Docker (PostgreSQL e Redis)? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🐳 Parando containers Docker..."
  docker stop ninetwo_pg 2>/dev/null || true
  docker stop ninetwo_redis 2>/dev/null || true
  echo "✅ Containers Docker parados!"
else
  echo "ℹ️  Containers Docker mantidos rodando"
fi
echo ""

echo "✅ NineTwo Performance CRM parado!"


