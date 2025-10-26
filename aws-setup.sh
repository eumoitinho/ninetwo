#!/bin/bash
set -e

echo "🚀 Setup NineTwo em AWS EC2"
echo "================================"

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 24.x (via nvm para facilitar)
echo "📦 Instalando Node.js 24.x..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 24
nvm use 24
npm install -g yarn

# 3. Instalar Docker e Docker Compose
echo "🐳 Instalando Docker..."
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER

# 4. Instalar PostgreSQL e Redis via Docker
echo "🗄️ Configurando PostgreSQL e Redis..."
cat > /home/ubuntu/docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: ninetwo-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: default
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: ninetwo-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Kafka (Confluent)
  zookeeper:
    image: confluentinc/cp-zookeeper:7.7.1
    container_name: ninetwo-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.7.1
    container_name: ninetwo-kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "29092:29092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:29092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1

  # Couchbase
  couchbase:
    image: couchbase:enterprise-7.6.4
    container_name: ninetwo-couchbase
    ports:
      - "8091-8096:8091-8096"
      - "11210:11210"
    environment:
      CLUSTER_NAME: ninetwo-cluster
      COUCHBASE_ADMINISTRATOR_USERNAME: Administrator
      COUCHBASE_ADMINISTRATOR_PASSWORD: password
    volumes:
      - couchbase_data:/opt/couchbase/var

volumes:
  postgres_data:
  redis_data:
  couchbase_data:
EOF

sudo docker compose -f /home/ubuntu/docker-compose.yml up -d

# 5. Aguardar serviços iniciarem
echo "⏳ Aguardando serviços iniciarem..."
sleep 30

# 6. Configurar Couchbase
echo "🗄️ Configurando Couchbase..."
docker exec ninetwo-couchbase /opt/couchbase/bin/couchbase-cli cluster-init \
  --cluster localhost \
  --cluster-username Administrator \
  --cluster-password password \
  --services data,index,query \
  --cluster-ramsize 2048 \
  --cluster-index-ramsize 512 \
  --index-storage-setting default

docker exec ninetwo-couchbase /opt/couchbase/bin/couchbase-cli bucket-create \
  --cluster localhost \
  --username Administrator \
  --password password \
  --bucket marketing-data \
  --bucket-type couchbase \
  --bucket-ramsize 512

docker exec ninetwo-couchbase /opt/couchbase/bin/couchbase-cli bucket-create \
  --cluster localhost \
  --username Administrator \
  --password password \
  --bucket analytics-cache \
  --bucket-type couchbase \
  --bucket-ramsize 512

# 7. Clonar repositório
echo "📥 Clonando repositório..."
cd /home/ubuntu
git clone https://github.com/eumoitinho/ninetwo.git
cd ninetwo

# 8. Configurar .env
echo "⚙️ Configurando variáveis de ambiente..."
cat > .env << 'ENVEOF'
# PostgreSQL
PG_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/default
POSTGRES_ADMIN_USER=postgres
POSTGRES_ADMIN_PASSWORD=postgres

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:29092

# Couchbase
COUCHBASE_CONNECTION_STRING=couchbase://localhost
COUCHBASE_USERNAME=Administrator
COUCHBASE_PASSWORD=password
COUCHBASE_BUCKET=marketing-data

# Server
SERVER_URL=http://localhost:3000
FRONT_BASE_URL=http://localhost:3001

# Google APIs (IMPORTANTE: Adicionar suas credenciais)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=your-dev-token

# Auth
ACCESS_TOKEN_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
LOGIN_TOKEN_SECRET=$(openssl rand -base64 32)
FILE_TOKEN_SECRET=$(openssl rand -base64 32)

# Storage
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=.local-storage
ENVEOF

# 9. Instalar dependências
echo "📦 Instalando dependências (pode levar alguns minutos)..."
yarn install

# 10. Build do projeto
echo "🔨 Compilando projeto..."
yarn nx run-many -t build -p ninetwo-server ninetwo-front

# 11. Inicializar banco de dados
echo "🗄️ Inicializando banco de dados..."
yarn nx run ninetwo-server:command -- workspace:sync-metadata

echo ""
echo "✅ Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo .env e adicione suas credenciais do Google"
echo "2. Inicie o servidor: yarn nx run-many -t start -p ninetwo-server ninetwo-front"
echo ""
echo "🌐 URLs:"
echo "- Backend: http://$(curl -s ifconfig.me):3000"
echo "- Frontend: http://$(curl -s ifconfig.me):3001"
echo "- Couchbase UI: http://$(curl -s ifconfig.me):8091"
echo ""

