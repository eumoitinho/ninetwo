#!/bin/bash

# Script de inicialização do NineTwo Performance CRM
# Cuida de watchers, Docker containers e cache automaticamente

set -e

echo "🚀 Iniciando NineTwo Performance CRM..."
echo ""

# ============================================
# 1. AUMENTAR FILE WATCHERS (se necessário)
# ============================================
CURRENT_WATCHERS=$(cat /proc/sys/fs/inotify/max_user_watches)
MIN_WATCHERS=524288

if [ "$CURRENT_WATCHERS" -lt "$MIN_WATCHERS" ]; then
  echo "📁 Aumentando file watchers para $MIN_WATCHERS..."
  echo fs.inotify.max_user_watches=$MIN_WATCHERS | sudo tee -a /etc/sysctl.conf > /dev/null
  sudo sysctl -p > /dev/null
  echo "✅ File watchers aumentados!"
else
  echo "✅ File watchers OK ($CURRENT_WATCHERS)"
fi
echo ""

# ============================================
# 2. VERIFICAR E INICIAR DOCKER CONTAINERS
# ============================================
echo "🐳 Verificando containers Docker..."

# PostgreSQL
if ! docker ps | grep -q "ninetwo_pg"; then
  echo "📦 Iniciando PostgreSQL..."
  docker start ninetwo_pg 2>/dev/null || {
    echo "⚠️  Container ninetwo_pg não existe. Criando..."
    make postgres-on-docker
  }
  sleep 3
  echo "✅ PostgreSQL iniciado!"
else
  echo "✅ PostgreSQL já está rodando"
fi

# Redis
if ! docker ps | grep -q "ninetwo_redis"; then
  echo "📦 Iniciando Redis..."
  docker start ninetwo_redis 2>/dev/null || {
    echo "⚠️  Container ninetwo_redis não existe. Criando..."
    make redis-on-docker
  }
  sleep 2
  echo "✅ Redis iniciado!"
else
  echo "✅ Redis já está rodando"
fi
echo ""

# ============================================
# 3. LIMPAR CACHE REDIS
# ============================================
echo "🧹 Limpando cache Redis..."
docker exec ninetwo_redis redis-cli FLUSHALL > /dev/null
echo "✅ Cache limpo!"
echo ""

# ============================================
# 4. LIMPAR PROCESSOS ANTIGOS
# ============================================
echo "🛑 Limpando processos antigos..."
pkill -9 -f "yarn start" 2>/dev/null || true
pkill -9 -f "node.*ninetwo" 2>/dev/null || true
sleep 2
echo "✅ Processos limpos!"
echo ""

# ============================================
# 5. VERIFICAR CONTAINERS ESTÃO SAUDÁVEIS
# ============================================
echo "🏥 Verificando saúde dos containers..."

# Testar PostgreSQL
if ! docker exec ninetwo_pg pg_isready -U postgres > /dev/null 2>&1; then
  echo "❌ PostgreSQL não está respondendo!"
  exit 1
fi
echo "✅ PostgreSQL OK"

# Testar Redis
if ! docker exec ninetwo_redis redis-cli PING > /dev/null 2>&1; then
  echo "❌ Redis não está respondendo!"
  exit 1
fi
echo "✅ Redis OK"
echo ""

# ============================================
# 6. INICIAR SERVIDOR
# ============================================
echo "🎯 Iniciando servidor ninetwo..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 NOTA: Aguarde ~2 minutos para compilação completa"
echo ""
echo "🌐 URLs disponíveis após inicialização:"
echo "   Frontend:  http://localhost:3000"
echo "   GraphQL:   http://localhost:3000/graphql"
echo "   Metadata:  http://localhost:3000/metadata"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

NX_DAEMON=false yarn start

