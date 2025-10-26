# Arquitetura NineTwo com Confluent + Couchbase

## Visão Geral: Melhor de Dois Mundos

```
┌─────────────────────────────────────────────────────────────────┐
│                     Arquitetura Híbrida                         │
│                                                                 │
│  Confluent Kafka = Event Streaming + Real-time Processing      │
│  Couchbase = Fast Storage + Cache + Search                     │
│  PostgreSQL = Source of Truth + Transações ACID                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Divisão de Responsabilidades

### **Confluent Kafka - Event Streaming Layer**
✅ Eventos em tempo real
✅ Event sourcing
✅ Change Data Capture (CDC)
✅ Stream processing
✅ Integrações assíncronas

### **Couchbase Capella - Fast Data Layer**
✅ Cache distribuído
✅ Armazenamento de analytics processadas
✅ Session storage
✅ Full-text search
✅ Queries rápidas

### **PostgreSQL RDS - Source of Truth**
✅ Dados transacionais
✅ Relações complexas
✅ ACID compliance
✅ Migrations e schema

---

## 2. Arquitetura Completa

```
┌───────────────────────────────────────────────────────────────────────┐
│                          AWS Cloud                                    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    EKS Cluster                              │    │
│  │                                                             │    │
│  │  ┌──────────┐         ┌──────────┐                        │    │
│  │  │  Server  │         │  Worker  │                        │    │
│  │  │   Pods   │         │   Pods   │                        │    │
│  │  └────┬─────┘         └────┬─────┘                        │    │
│  │       │                    │                               │    │
│  └───────┼────────────────────┼───────────────────────────────┘    │
│          │                    │                                     │
│          │                    │                                     │
│  ┌───────▼────────────────────▼───────────┐                        │
│  │                                         │                        │
│  │  ┌──────────────────────────────────┐  │                        │
│  │  │    Confluent Cloud (Kafka)       │  │ ◄── Event Streaming   │
│  │  │                                  │  │                        │
│  │  │  Topics:                         │  │                        │
│  │  │  • marketing.events              │  │                        │
│  │  │  • marketing.metrics.raw         │  │                        │
│  │  │  • marketing.campaigns           │  │                        │
│  │  │  • user.activity                 │  │                        │
│  │  │  • system.audit                  │  │                        │
│  │  │                                  │  │                        │
│  │  │  Stream Processing (ksqlDB):     │  │                        │
│  │  │  • Aggregations                  │  │                        │
│  │  │  • Transformations               │  │                        │
│  │  │  • Enrichment                    │  │                        │
│  │  └──────────┬───────────────────────┘  │                        │
│  │             │                           │                        │
│  │             │ Produce                   │                        │
│  │             │ Consume                   │                        │
│  │             │                           │                        │
│  └─────────────┼───────────────────────────┘                        │
│                │                                                    │
│       ┌────────┼────────────┐                                      │
│       │        │            │                                      │
│       ▼        ▼            ▼                                      │
│  ┌────────┐ ┌──────────┐ ┌─────────────┐                         │
│  │  RDS   │ │ Couchbase│ │     S3      │                         │
│  │  PG    │ │ Capella  │ │   Buckets   │                         │
│  │        │ │          │ │             │                         │
│  │ WRITE  │ │  READ    │ │  Archive    │                         │
│  │ Master │ │  Cache   │ │  Backup     │                         │
│  └────────┘ │  Search  │ └─────────────┘                         │
│             │  Analytics│                                          │
│             └───────────┘                                          │
└───────────────────────────────────────────────────────────────────┘

                External Services
                ┌─────────────┐
                │   Google    │
                │   Ads API   │───┐
                └─────────────┘   │
                                  │
                ┌─────────────┐   │
                │   Google    │   │  Webhooks/
                │ Analytics   │───┤  API Calls
                └─────────────┘   │    │
                                  │    │
                ┌─────────────┐   │    │
                │  Meta Ads   │───┘    │
                │     API     │        │
                └─────────────┘        │
                        │              │
                        └──────────────┘
                               │
                        Produce Events
                               ▼
                        Confluent Kafka
```

---

## 3. Fluxo de Dados Detalhado

### **Fluxo 1: Marketing Data Ingestion**

```
┌─────────────────────────────────────────────────────────────────┐
│  1. API Externa (Google Ads) → Worker Pod                      │
│     ↓                                                           │
│  2. Worker publica evento → Kafka Topic (marketing.metrics.raw)│
│     ↓                                                           │
│  3. ksqlDB processa/agrega → Kafka (marketing.metrics.agg)     │
│     ↓                                                           │
│  4. Consumer grava → Couchbase (fast queries)                  │
│     ↓                                                           │
│  5. Background job → PostgreSQL (long-term storage)            │
└─────────────────────────────────────────────────────────────────┘
```

**Código de exemplo:**

```typescript
// packages/ninetwo-server/src/modules/marketing/services/google-ads-ingestion.service.ts

import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from '../../kafka/kafka-producer.service';

@Injectable()
export class GoogleAdsIngestionService {
  constructor(
    private kafkaProducer: KafkaProducerService,
  ) {}

  async ingestCampaignMetrics(campaignId: string, dateRange: DateRange) {
    // 1. Fetch data from Google Ads API
    const metrics = await this.googleAdsClient.getCampaignMetrics(
      campaignId,
      dateRange
    );

    // 2. Publish raw event to Kafka
    await this.kafkaProducer.send({
      topic: 'marketing.metrics.raw',
      messages: [{
        key: `campaign-${campaignId}`,
        value: JSON.stringify({
          source: 'google_ads',
          campaignId,
          timestamp: new Date(),
          metrics: {
            impressions: metrics.impressions,
            clicks: metrics.clicks,
            cost: metrics.cost,
            conversions: metrics.conversions,
          },
          metadata: {
            adGroupId: metrics.adGroupId,
            keywords: metrics.keywords,
          }
        }),
        headers: {
          'event-type': 'campaign-metrics-received',
          'source': 'google-ads-api',
        }
      }]
    });

    console.log(`✅ Published metrics for campaign ${campaignId} to Kafka`);
  }
}
```

### **Fluxo 2: Real-time Stream Processing**

```sql
-- ksqlDB Stream Processing

-- 1. Create stream from raw topic
CREATE STREAM marketing_metrics_raw (
  source VARCHAR,
  campaignId VARCHAR,
  timestamp BIGINT,
  metrics STRUCT<
    impressions INTEGER,
    clicks INTEGER,
    cost DOUBLE,
    conversions INTEGER
  >
) WITH (
  KAFKA_TOPIC='marketing.metrics.raw',
  VALUE_FORMAT='JSON'
);

-- 2. Aggregate metrics by campaign and hour
CREATE TABLE campaign_hourly_stats AS
  SELECT
    campaignId,
    WINDOWSTART AS window_start,
    WINDOWEND AS window_end,
    SUM(metrics->impressions) AS total_impressions,
    SUM(metrics->clicks) AS total_clicks,
    SUM(metrics->cost) AS total_cost,
    SUM(metrics->conversions) AS total_conversions,
    (SUM(metrics->clicks) / SUM(metrics->impressions)) * 100 AS ctr,
    SUM(metrics->cost) / SUM(metrics->conversions) AS cpa
  FROM marketing_metrics_raw
  WINDOW TUMBLING (SIZE 1 HOUR)
  GROUP BY campaignId
  EMIT CHANGES;

-- 3. Create alerts for high spend
CREATE STREAM high_spend_alerts AS
  SELECT
    campaignId,
    total_cost,
    window_start
  FROM campaign_hourly_stats
  WHERE total_cost > 1000
  EMIT CHANGES;
```

### **Fluxo 3: Consumer → Couchbase**

```typescript
// packages/ninetwo-server/src/modules/marketing/consumers/metrics-consumer.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService } from '../../kafka/kafka-consumer.service';
import { CouchbaseService } from '../../couchbase/couchbase.service';

@Injectable()
export class MetricsConsumerService implements OnModuleInit {
  constructor(
    private kafkaConsumer: KafkaConsumerService,
    private couchbase: CouchbaseService,
  ) {}

  async onModuleInit() {
    await this.kafkaConsumer.subscribe({
      topics: ['marketing.metrics.aggregated'],
      groupId: 'marketing-metrics-couchbase-writer',
      fromBeginning: false,
    });

    await this.kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());

        // Write to Couchbase for fast queries
        await this.couchbase.upsert(
          `campaign:${data.campaignId}:hour:${data.window_start}`,
          {
            type: 'campaign_hourly_stats',
            campaignId: data.campaignId,
            timestamp: data.window_start,
            metrics: {
              impressions: data.total_impressions,
              clicks: data.total_clicks,
              cost: data.total_cost,
              conversions: data.total_conversions,
              ctr: data.ctr,
              cpa: data.cpa,
            },
            processedAt: new Date(),
          },
          {
            // TTL de 90 dias
            expiry: 90 * 24 * 60 * 60,
          }
        );

        console.log(`✅ Stored metrics in Couchbase: ${data.campaignId}`);
      },
    });
  }
}
```

---

## 4. Configuração do Confluent Cloud

### **Cluster Configuration**

```yaml
Provider: AWS
Region: us-east-1 (mesma do EKS)
Cluster Type: Standard (ou Basic para começar)

Cluster Size:
  - Basic: até 250 MB/s (grátis com créditos)
  - Standard: até 1000 MB/s
  - Dedicated: Custom (para produção alta carga)

Recomendado Inicial: Standard
Custo: ~$100-150/mês
```

### **Topics a Criar**

```yaml
Topics:
  # Raw events
  - Name: marketing.metrics.raw
    Partitions: 6
    Retention: 7 days
    Cleanup: delete

  - Name: marketing.campaigns.changes
    Partitions: 3
    Retention: 30 days
    Cleanup: compact  # Keep only latest

  - Name: user.activity
    Partitions: 12
    Retention: 7 days
    Cleanup: delete

  # Processed/Aggregated
  - Name: marketing.metrics.aggregated
    Partitions: 6
    Retention: 30 days
    Cleanup: delete

  - Name: marketing.alerts
    Partitions: 1
    Retention: 90 days
    Cleanup: delete

  # CDC from PostgreSQL
  - Name: postgres.cdc.campaigns
    Partitions: 3
    Retention: 7 days
    Cleanup: delete
```

### **ksqlDB Configuration**

```yaml
Enable ksqlDB: Yes
Cluster Size: 1 CSU (começar pequeno)
Scaling: Auto (quando necessário)
```

### **Connectors**

```yaml
Connectors Recomendados:

1. PostgreSQL CDC Source:
   - Capture changes from RDS
   - Topics: postgres.cdc.*
   - Use: Debezium PostgreSQL CDC Connector

2. Couchbase Sink:
   - Write to Couchbase
   - Topics: *.aggregated
   - Use: Couchbase Kafka Connector

3. S3 Sink:
   - Archive to S3
   - Topics: marketing.metrics.raw
   - Use: S3 Sink Connector (Confluent)
```

---

## 5. Casos de Uso Específicos

### **Caso 1: Real-time Marketing Dashboard**

```
User abre dashboard
       ↓
Query Couchbase (cache quente - últimas 24h)
       ↓
Se dado não existe → Query PostgreSQL
       ↓
Background: Kafka publica evento "dashboard.viewed"
       ↓
ksqlDB analisa padrões de uso
```

**Implementação:**

```typescript
// packages/ninetwo-server/src/modules/marketing/services/dashboard.service.ts

@Injectable()
export class MarketingDashboardService {
  constructor(
    private couchbase: CouchbaseService,
    private postgres: PrismaService,
    private kafka: KafkaProducerService,
  ) {}

  async getDashboardData(userId: string, dateRange: DateRange) {
    // 1. Try Couchbase first (fast)
    const cacheKey = `dashboard:${userId}:${dateRange.start}:${dateRange.end}`;

    try {
      const cached = await this.couchbase.get(cacheKey);

      // Publish analytics event
      await this.kafka.send({
        topic: 'user.activity',
        messages: [{
          value: JSON.stringify({
            event: 'dashboard.viewed',
            userId,
            cacheHit: true,
            timestamp: new Date(),
          })
        }]
      });

      return cached.content;
    } catch (error) {
      // Cache miss - fallback to PostgreSQL
      const data = await this.fetchFromPostgres(dateRange);

      // Store in cache for next time
      await this.couchbase.upsert(cacheKey, data, { expiry: 3600 });

      await this.kafka.send({
        topic: 'user.activity',
        messages: [{
          value: JSON.stringify({
            event: 'dashboard.viewed',
            userId,
            cacheHit: false,
            timestamp: new Date(),
          })
        }]
      });

      return data;
    }
  }

  private async fetchFromPostgres(dateRange: DateRange) {
    return this.postgres.analyticsData.findMany({
      where: {
        date: {
          gte: dateRange.start,
          lte: dateRange.end,
        }
      },
      include: {
        marketingChannel: true,
      }
    });
  }
}
```

### **Caso 2: Change Data Capture (CDC)**

```
PostgreSQL UPDATE campaigns
       ↓
Debezium CDC Connector captura
       ↓
Publica em postgres.cdc.campaigns
       ↓
Consumer atualiza Couchbase cache
       ↓
Consumer invalida cache relacionado
```

### **Caso 3: Alert System**

```
ksqlDB detecta anomalia (gasto > threshold)
       ↓
Publica em marketing.alerts
       ↓
Alert Consumer processa
       ↓
Envia notificação (email/Slack)
```

**ksqlDB Query:**

```sql
-- Detectar campanhas com CPA alto
CREATE STREAM high_cpa_alerts AS
  SELECT
    campaignId,
    cpa,
    total_cost,
    window_start
  FROM campaign_hourly_stats
  WHERE cpa > 50 AND total_conversions > 0
  EMIT CHANGES;
```

**Consumer:**

```typescript
@Injectable()
export class AlertConsumerService implements OnModuleInit {
  async onModuleInit() {
    await this.kafkaConsumer.subscribe({
      topics: ['marketing.alerts', 'HIGH_CPA_ALERTS'],
      groupId: 'alert-notification-service',
    });

    await this.kafkaConsumer.run({
      eachMessage: async ({ message }) => {
        const alert = JSON.parse(message.value.toString());

        // Send notification
        await this.notificationService.send({
          type: 'high_cpa_alert',
          severity: 'warning',
          message: `Campaign ${alert.campaignId} has high CPA: $${alert.cpa}`,
          data: alert,
        });
      },
    });
  }
}
```

---

## 6. Estrutura de Código

```
packages/ninetwo-server/src/
├── modules/
│   ├── kafka/
│   │   ├── kafka.module.ts
│   │   ├── kafka-producer.service.ts
│   │   ├── kafka-consumer.service.ts
│   │   └── kafka.config.ts
│   │
│   ├── couchbase/
│   │   ├── couchbase.module.ts
│   │   ├── couchbase.service.ts
│   │   └── couchbase.config.ts
│   │
│   └── marketing/
│       ├── producers/
│       │   ├── metrics-producer.service.ts
│       │   └── events-producer.service.ts
│       │
│       ├── consumers/
│       │   ├── metrics-consumer.service.ts
│       │   ├── alerts-consumer.service.ts
│       │   └── cdc-consumer.service.ts
│       │
│       ├── services/
│       │   ├── dashboard.service.ts
│       │   ├── google-ads-ingestion.service.ts
│       │   └── analytics-aggregation.service.ts
│       │
│       └── marketing.module.ts
```

---

## 7. Configuração de Ambiente

```bash
# Confluent Kafka
KAFKA_BROKERS=pkc-xxxxx.us-east-1.aws.confluent.cloud:9092
KAFKA_API_KEY=your-api-key
KAFKA_API_SECRET=your-api-secret
KAFKA_SASL_MECHANISM=PLAIN
KAFKA_SECURITY_PROTOCOL=SASL_SSL

# ksqlDB
KSQLDB_ENDPOINT=https://pksqlc-xxxxx.us-east-1.aws.confluent.cloud
KSQLDB_API_KEY=your-ksqldb-key
KSQLDB_API_SECRET=your-ksqldb-secret

# Couchbase (já configurado)
COUCHBASE_CONNECTION_STRING=couchbases://cb.xxxxx.cloud.couchbase.com
COUCHBASE_USERNAME=ninetwo_app
COUCHBASE_PASSWORD=your-password

# Feature flags
ENABLE_KAFKA_STREAMING=true
ENABLE_COUCHBASE_CACHE=true
ENABLE_CDC=true
```

---

## 8. Estimativa de Custos Combinados

| Serviço | Configuração | Custo/Mês |
|---------|--------------|-----------|
| **Confluent Kafka** | Standard, 6 topics, 100GB/day | $150 |
| **ksqlDB** | 1 CSU | $50 |
| **Connectors** | 2-3 connectors | $40 |
| **Couchbase** | 3 nodes, 2vCPU | $120 |
| **RDS PostgreSQL** | db.t3.medium (reduzido) | $60 |
| **ElastiCache Redis** | cache.t3.small (reduzido) | $40 |
| **Total** | | **$460/mês** |

**Com créditos:**
- Couchbase: $5.000 → ~41 meses grátis
- Confluent: (assumindo créditos) → vários meses grátis
- **Custo real AWS**: ~$100/mês (RDS + Redis reduzidos)

---

## 9. Benefícios da Arquitetura Híbrida

### **Performance**
- ⚡ Queries dashboard: < 50ms (Couchbase cache)
- ⚡ Stream processing: real-time (Kafka)
- ⚡ CDC latency: < 1 segundo

### **Escalabilidade**
- 📈 Kafka: escala horizontalmente automaticamente
- 📈 Couchbase: add nodes sob demanda
- 📈 PostgreSQL: read replicas quando necessário

### **Resiliência**
- 🛡️ Kafka: retenção de 7-30 dias (replay possível)
- 🛡️ Couchbase: replicação automática
- 🛡️ Multi-layer: falha em um não afeta outros

### **Custo-Benefício**
- 💰 Reduz carga no PostgreSQL (menos recursos)
- 💰 Reduz carga no Redis (Couchbase assume parte)
- 💰 Créditos cobrem maioria dos custos

---

## 10. Próximos Passos

1. **Setup Confluent Cloud** (agora)
   - Criar cluster
   - Criar topics
   - Configurar ksqlDB

2. **Setup Couchbase** (paralelo)
   - Criar cluster
   - Criar buckets
   - Criar índices

3. **Implementar módulos** (código)
   - Kafka producer/consumer
   - Couchbase service
   - Marketing ingestion

4. **Testar fluxo completo**
   - Ingestão → Kafka → ksqlDB → Couchbase
   - Dashboard queries
   - Alerts

5. **Monitorar e otimizar**
   - Confluent metrics
   - Couchbase metrics
   - Ajustar partições/índices

---

Quer que eu crie os arquivos de implementação do módulo Kafka + Couchbase agora?

