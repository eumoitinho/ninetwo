# Configuração do Couchbase Capella para NineTwo

## Guia de Setup do Cluster

### 1. Configurações Iniciais do Cluster

#### **Nome do Cluster**
```
ninetwo-production
```
ou
```
ninetwo-staging
```

---

### 2. Configuração de Cloud Provider

#### **Provider: AWS** ✅
- **Região**: `us-east-1` (mesma região do seu EKS)
- **Motivo**: Menor latência, sem cross-region data transfer costs

**Alternativas:**
- Se seu EKS estiver em outra região, use a mesma
- Multi-region só se necessário (aumenta custos)

---

### 3. Especificação do Cluster

#### **Para Produção (Recomendado Inicial):**

```yaml
Cluster Tier: Enterprise
Nodes: 3 (recomendado para HA)
Node Size: 4 vCPU, 16 GB RAM
Storage per Node: 100 GB (SSD)
Total Storage: 300 GB

Serviços Habilitados:
  ✅ Data Service (obrigatório)
  ✅ Query Service (N1QL queries)
  ✅ Index Service (performance)
  ✅ Search Service (full-text search)
  ⚠️ Analytics Service (opcional - desabilitar no início)
  ⚠️ Eventing Service (opcional - desabilitar no início)
```

**Custo Estimado:** ~$150-200/mês (coberto pelos créditos)

#### **Para Desenvolvimento/Staging (Economia):**

```yaml
Cluster Tier: Developer Pro
Nodes: 1 (single node)
Node Size: 2 vCPU, 8 GB RAM
Storage: 50 GB

Serviços Habilitados:
  ✅ Data Service
  ✅ Query Service
  ✅ Index Service
  ❌ Search Service (adicionar quando necessário)
```

**Custo Estimado:** ~$50-80/mês

---

### 4. Configuração de Rede

#### **VPC Peering (Recomendado para Produção)**

```yaml
Connection Type: VPC Peering
AWS Account ID: [seu-account-id]
VPC ID: [id-da-vpc-do-eks]
CIDR Block: 10.0.0.0/16 (ajuste conforme sua VPC)

Allowed IP Addresses:
  - 10.0.0.0/16 (toda sua VPC)
  # ou específico:
  - 10.0.3.0/24 (subnet dos EKS nodes AZ1)
  - 10.0.4.0/24 (subnet dos EKS nodes AZ2)
```

**Passos para VPC Peering:**
1. Capella criará um VPC Peering Request
2. Você aceita no AWS Console
3. Atualiza Route Tables da sua VPC para rotear para Capella

#### **Public IP (Alternativa Simples - Início)**

```yaml
Connection Type: Public Internet
Allowed IP Addresses:
  # IPs dos NAT Gateways do EKS
  - [NAT-Gateway-1-EIP]/32
  - [NAT-Gateway-2-EIP]/32

  # Seu IP para desenvolvimento
  - [seu-ip-publico]/32
```

**Como obter IPs dos NAT Gateways:**
```bash
aws ec2 describe-nat-gateways \
  --filter "Name=vpc-id,Values=vpc-xxxxx" \
  --query 'NatGateways[*].NatGatewayAddresses[0].PublicIp'
```

---

### 5. Configuração de Buckets (Databases)

#### **Bucket Principal: `ninetwo_marketing`**

```yaml
Name: ninetwo_marketing
Memory Quota: 2048 MB (inicial)
Replicas: 1 (para HA)
Bucket Type: Couchbase
Ejection Method: Value Ejection
Conflict Resolution: Sequence Number
Compression Mode: Passive
Max TTL: 2592000 (30 dias - opcional)
Durability: majority (recomendado)
```

**Scopes e Collections:**

```
ninetwo_marketing (bucket)
├── _default (scope)
│   └── _default (collection)
│
├── analytics (scope)
│   ├── campaigns (collection)
│   ├── metrics (collection)
│   ├── events (collection)
│   └── aggregated (collection)
│
├── sessions (scope)
│   └── user_sessions (collection)
│
└── cache (scope)
    └── api_cache (collection)
```

#### **Bucket Secundário: `ninetwo_sessions`** (Opcional)

```yaml
Name: ninetwo_sessions
Memory Quota: 512 MB
Replicas: 0 (dados efêmeros)
Max TTL: 86400 (24 horas)
Bucket Type: Ephemeral (só memória, sem persistência)
```

---

### 6. Configuração de Índices

#### **Índices Primários (Criar após setup):**

```sql
-- Conectar via Query Workbench e executar:

-- Índice primário geral (usar com cuidado)
CREATE PRIMARY INDEX ON `ninetwo_marketing`.`analytics`.`campaigns`;

-- Índices específicos (melhor performance)
CREATE INDEX idx_campaign_date ON `ninetwo_marketing`.`analytics`.`campaigns`(date, channel);

CREATE INDEX idx_campaign_channel ON `ninetwo_marketing`.`analytics`.`campaigns`(channel, date)
WHERE type = 'campaign_performance';

CREATE INDEX idx_metrics_date_range ON `ninetwo_marketing`.`analytics`.`metrics`(date, campaignId)
WHERE type = 'daily_metrics';

-- Índice para sessions
CREATE INDEX idx_session_userId ON `ninetwo_marketing`.`sessions`.`user_sessions`(userId, expiresAt);
```

#### **Full-Text Search Index:**

```json
{
  "name": "campaigns_search",
  "type": "fulltext-index",
  "sourceName": "ninetwo_marketing",
  "sourceType": "couchbase",
  "planParams": {
    "indexPartitions": 6
  },
  "params": {
    "mapping": {
      "types": {
        "analytics.campaigns": {
          "enabled": true,
          "properties": {
            "name": {
              "enabled": true,
              "fields": [{
                "name": "name",
                "type": "text",
                "analyzer": "standard"
              }]
            },
            "description": {
              "enabled": true,
              "fields": [{
                "name": "description",
                "type": "text",
                "analyzer": "standard"
              }]
            },
            "channel": {
              "enabled": true,
              "fields": [{
                "name": "channel",
                "type": "keyword"
              }]
            }
          }
        }
      }
    }
  }
}
```

---

### 7. Configuração de Segurança

#### **Database Credentials:**

```yaml
Username: ninetwo_app
Password: [gerar senha forte]

Permissions:
  Bucket: ninetwo_marketing
  Access:
    - Data Reader
    - Data Writer
    - Query Select
    - Query Update
    - Query Insert
    - Query Delete
    - Search Reader

  Bucket: ninetwo_sessions
  Access:
    - Data Reader
    - Data Writer
```

**Gerar senha segura:**
```bash
openssl rand -base64 32
```

#### **IP Allowlist (já configurado no passo 4)**

#### **TLS/SSL:**
```yaml
Encryption in Transit: ✅ Enabled (obrigatório)
Certificate Type: Capella Managed (recomendado)
```

---

### 8. Connection String Final

Após criar o cluster, você receberá:

```
couchbases://cb.xxxxx.cloud.couchbase.com
```

**No formato completo:**
```
couchbases://cb.xxxxx.cloud.couchbase.com?ssl=no_verify&ipv6=allow
```

---

### 9. Configuração no NineTwo

#### **Variáveis de Ambiente (.env):**

```bash
# Couchbase Capella
COUCHBASE_CONNECTION_STRING=couchbases://cb.xxxxx.cloud.couchbase.com
COUCHBASE_USERNAME=ninetwo_app
COUCHBASE_PASSWORD=your-secure-password-here
COUCHBASE_BUCKET_MARKETING=ninetwo_marketing
COUCHBASE_BUCKET_SESSIONS=ninetwo_sessions

# Enable Couchbase features
ENABLE_COUCHBASE_ANALYTICS=true
ENABLE_COUCHBASE_CACHE=true
ENABLE_COUCHBASE_SESSIONS=false  # começar false, habilitar depois
```

#### **Kubernetes Secret:**

```bash
kubectl create secret generic couchbase-credentials \
  --from-literal=connection-string='couchbases://cb.xxxxx.cloud.couchbase.com' \
  --from-literal=username='ninetwo_app' \
  --from-literal=password='your-secure-password' \
  --namespace=ninetwo
```

---

### 10. Diagrama da Configuração

```
┌─────────────────────────────────────────────────────────────┐
│              Couchbase Capella Cluster                      │
│                    (us-east-1)                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node 1 (4vCPU, 16GB RAM, 100GB SSD)                │  │
│  │    Services: Data + Query + Index + Search          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node 2 (4vCPU, 16GB RAM, 100GB SSD)                │  │
│  │    Services: Data + Query + Index + Search          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node 3 (4vCPU, 16GB RAM, 100GB SSD)                │  │
│  │    Services: Data + Query + Index + Search          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Buckets                                 │  │
│  │  • ninetwo_marketing (2GB RAM, 300GB Storage)       │  │
│  │  • ninetwo_sessions (512MB RAM, Ephemeral)          │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ VPC Peering / Public IP
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    AWS VPC (10.0.0.0/16)                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              EKS Cluster                             │  │
│  │    • ninetwo-server pods                            │  │
│  │    • ninetwo-worker pods                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 11. Checklist de Configuração

#### **Passo 1: Criar Cluster** ✅
- [ ] Provider: AWS
- [ ] Região: us-east-1 (ou mesma do EKS)
- [ ] Tier: Enterprise (ou Developer Pro para dev)
- [ ] Nodes: 3 (prod) ou 1 (dev)
- [ ] Node Size: 4vCPU/16GB (prod) ou 2vCPU/8GB (dev)
- [ ] Storage: 100GB por node

#### **Passo 2: Configurar Serviços** ✅
- [ ] Data Service
- [ ] Query Service
- [ ] Index Service
- [ ] Search Service

#### **Passo 3: Configurar Rede** ✅
- [ ] Opção A: VPC Peering (recomendado)
  - [ ] Criar peering request
  - [ ] Aceitar no AWS Console
  - [ ] Atualizar route tables
- [ ] Opção B: Public IP
  - [ ] Adicionar IPs dos NAT Gateways
  - [ ] Adicionar seu IP para testes

#### **Passo 4: Criar Buckets** ✅
- [ ] ninetwo_marketing (2GB, Couchbase, 1 replica)
- [ ] ninetwo_sessions (512MB, Ephemeral, 0 replicas)

#### **Passo 5: Criar Scopes e Collections** ✅
- [ ] analytics scope
  - [ ] campaigns collection
  - [ ] metrics collection
  - [ ] events collection
- [ ] sessions scope
  - [ ] user_sessions collection
- [ ] cache scope
  - [ ] api_cache collection

#### **Passo 6: Criar Índices** ✅
- [ ] idx_campaign_date
- [ ] idx_campaign_channel
- [ ] idx_metrics_date_range
- [ ] idx_session_userId
- [ ] campaigns_search (FTS)

#### **Passo 7: Configurar Credenciais** ✅
- [ ] Criar user: ninetwo_app
- [ ] Configurar permissions
- [ ] Salvar credenciais no Secrets Manager AWS
- [ ] Criar Kubernetes secret

#### **Passo 8: Testar Conectividade** ✅
- [ ] Testar conexão do cluster
- [ ] Executar query simples
- [ ] Testar insert/update/delete

---

### 12. Comandos de Teste

#### **Teste de Conectividade (Node.js):**

```javascript
const couchbase = require('couchbase');

async function testConnection() {
  const cluster = await couchbase.connect(
    'couchbases://cb.xxxxx.cloud.couchbase.com',
    {
      username: 'ninetwo_app',
      password: 'your-password',
      timeouts: {
        kvTimeout: 10000,
      },
    }
  );

  console.log('✅ Connected to Couchbase Capella');

  const bucket = cluster.bucket('ninetwo_marketing');
  const collection = bucket.scope('analytics').collection('campaigns');

  // Test insert
  await collection.upsert('test-doc', {
    type: 'test',
    message: 'Hello from NineTwo!',
    timestamp: new Date(),
  });

  console.log('✅ Document inserted');

  // Test query
  const result = await cluster.query(
    'SELECT * FROM `ninetwo_marketing`.`analytics`.`campaigns` WHERE type = $1',
    { parameters: ['test'] }
  );

  console.log('✅ Query result:', result.rows);

  await cluster.close();
}

testConnection();
```

#### **Teste via kubectl (do pod):**

```bash
# Entrar no pod
kubectl exec -it deployment/ninetwo-server -n ninetwo -- /bin/sh

# Instalar couchbase SDK (se não estiver)
npm install couchbase

# Criar arquivo test.js com código acima
node test.js
```

---

### 13. Monitoramento

#### **Métricas para Acompanhar na Capella UI:**

- **Operations/sec**: Deve estar < 10,000 no início
- **Memory Used**: Deve estar < 70% da quota
- **Disk Used**: Monitorar crescimento
- **Query Latency**: Deve ser < 100ms para queries simples
- **Cache Hit Ratio**: Alvo > 90%

#### **Alertas Recomendados:**

```yaml
Alerts:
  - Memory usage > 80%
  - Disk usage > 85%
  - Node down
  - Query latency > 500ms
  - Cache hit ratio < 70%
```

---

### 14. Estimativa de Uso dos Créditos

| Configuração | Custo/Mês | Créditos Duram |
|--------------|-----------|----------------|
| **Produção Full** (3 nodes 4vCPU) | $180 | 27 meses |
| **Produção Medium** (3 nodes 2vCPU) | $120 | 41 meses |
| **Dev + Prod Small** (1+2 nodes) | $140 | 35 meses |
| **Dev Only** (1 node 2vCPU) | $60 | 83 meses |

**Recomendação:**
- Começar com configuração **Medium** (3 nodes, 2vCPU cada)
- Escalar para Full quando necessário
- **Duração estimada:** ~3 anos de uso gratuito

---

### 15. Próximos Passos

1. **Criar cluster agora** com configuração Medium
2. **Testar conectividade** do EKS
3. **Implementar módulo Couchbase** no código (próximo passo)
4. **Migrar dados de marketing** gradualmente
5. **Monitorar performance** e ajustar

---

## Resumo da Configuração Recomendada

```yaml
🏗️ CONFIGURAÇÃO INICIAL RECOMENDADA

Cluster Name: ninetwo-production
Provider: AWS
Region: us-east-1
Tier: Enterprise

Nodes: 3
Size: 2 vCPU, 8 GB RAM, 50 GB SSD (pode escalar depois)
Services: Data, Query, Index, Search

Network: Public IP (NAT Gateways)
        (migrar para VPC Peering depois)

Buckets:
  - ninetwo_marketing (1GB RAM, Couchbase, 1 replica)
  - ninetwo_sessions (256MB RAM, Ephemeral, 0 replicas)

Custo: ~$120/mês
Créditos duram: ~41 meses
```

---

Me confirma se criou o cluster e te ajudo com os próximos passos de integração no código!

