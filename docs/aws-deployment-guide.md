# Guia de Hospedagem do NineTwo na AWS com Kubernetes

## Índice
1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Opções de Deployment](#opções-de-deployment)
3. [Arquitetura Recomendada - EKS](#arquitetura-recomendada---eks)
4. [Componentes da Infraestrutura](#componentes-da-infraestrutura)
5. [Estimativa de Custos](#estimativa-de-custos)
6. [Guia de Implementação Passo a Passo](#guia-de-implementação-passo-a-passo)
7. [Monitoramento e Observabilidade](#monitoramento-e-observabilidade)
8. [Segurança](#segurança)
9. [Backup e Disaster Recovery](#backup-e-disaster-recovery)
10. [CI/CD](#cicd)

---

## Visão Geral da Arquitetura

O projeto NineTwo é uma aplicação full-stack baseada no Twenty CRM com os seguintes componentes:

### Componentes Principais
- **Frontend**: React (ninetwo-front)
- **Backend API**: NestJS (ninetwo-server)
- **Worker**: Background jobs e processamento assíncrono
- **Banco de Dados**: PostgreSQL 16
- **Cache/Queue**: Redis
- **Storage**: S3 para arquivos (local storage no desenvolvimento)

### Arquitetura Atual (Docker/Kubernetes)
```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                     │
│                    (Ingress)                        │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼─────┐              ┌─────▼────┐
    │  Server  │              │  Worker  │
    │   Pod    │              │   Pod    │
    └────┬─────┘              └─────┬────┘
         │                          │
    ┌────▼──────────────────────────▼────┐
    │                                     │
┌───▼────┐                        ┌──────▼──┐
│ Redis  │                        │  PgSQL  │
│  Pod   │                        │   Pod   │
└────────┘                        └─────────┘
```

---

## Opções de Deployment

### Opção 1: EKS (Elastic Kubernetes Service) - **RECOMENDADO**
✅ Escalabilidade automática
✅ Alta disponibilidade nativa
✅ Compatível com a estrutura K8s existente
✅ Gerenciamento simplificado do control plane
✅ Integração com serviços AWS (RDS, ElastiCache, S3)

**Ideal para**: Produção, ambientes que precisam escalar, equipes familiarizadas com Kubernetes

### Opção 2: ECS com Fargate
✅ Serverless (sem gerenciar servidores)
✅ Mais simples que EKS
✅ Boa integração AWS
⚠️ Requer adaptação dos manifestos K8s para Task Definitions

**Ideal para**: Equipes pequenas, menos complexidade operacional

### Opção 3: EC2 com Kubernetes Self-Managed
⚠️ Mais controle, mas mais complexidade
⚠️ Responsabilidade total sobre o cluster
❌ Não recomendado (use EKS em vez disso)

---

## Arquitetura Recomendada - EKS

### Diagrama Completo da Infraestrutura AWS

```
┌─────────────────────────────────────────────────────────────────┐
│                          AWS Cloud                              │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │               Route 53 (DNS)                           │    │
│  │         app.ninetwo.com → ALB                          │    │
│  └──────────────────────┬─────────────────────────────────┘    │
│                         │                                       │
│  ┌──────────────────────▼─────────────────────────────────┐    │
│  │    CloudFront (CDN) + WAF + SSL/TLS                    │    │
│  └──────────────────────┬─────────────────────────────────┘    │
│                         │                                       │
│  ┌──────────────────────▼─────────────────────────────────┐    │
│  │  Application Load Balancer (ALB)                       │    │
│  │    - SSL Termination                                   │    │
│  │    - Health Checks                                     │    │
│  └──────────────────────┬─────────────────────────────────┘    │
│                         │                                       │
│  ┌──────────────────────▼─────────────────────────────────┐    │
│  │              VPC (10.0.0.0/16)                         │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │       Availability Zone 1 (us-east-1a)          │   │    │
│  │  │                                                 │   │    │
│  │  │  ┌──────────────────────────────────────┐      │   │    │
│  │  │  │  Public Subnet (10.0.1.0/24)         │      │   │    │
│  │  │  │    - NAT Gateway                     │      │   │    │
│  │  │  │    - ALB Nodes                       │      │   │    │
│  │  │  └──────────────────────────────────────┘      │   │    │
│  │  │                                                 │   │    │
│  │  │  ┌──────────────────────────────────────┐      │   │    │
│  │  │  │  Private Subnet App (10.0.3.0/24)    │      │   │    │
│  │  │  │    ┌─────────────────────────┐       │      │   │    │
│  │  │  │    │  EKS Node Group 1       │       │      │   │    │
│  │  │  │    │  - Server Pods          │       │      │   │    │
│  │  │  │    │  - Worker Pods          │       │      │   │    │
│  │  │  │    │  (t3.large)             │       │      │   │    │
│  │  │  │    └─────────────────────────┘       │      │   │    │
│  │  │  └──────────────────────────────────────┘      │   │    │
│  │  │                                                 │   │    │
│  │  │  ┌──────────────────────────────────────┐      │   │    │
│  │  │  │  Private Subnet Data (10.0.5.0/24)   │      │   │    │
│  │  │  │    - RDS PostgreSQL (Primary)        │      │   │    │
│  │  │  │    - ElastiCache Redis (Primary)     │      │   │    │
│  │  │  └──────────────────────────────────────┘      │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │       Availability Zone 2 (us-east-1b)          │   │    │
│  │  │                                                 │   │    │
│  │  │  ┌──────────────────────────────────────┐      │   │    │
│  │  │  │  Public Subnet (10.0.2.0/24)         │      │   │    │
│  │  │  │    - NAT Gateway                     │      │   │    │
│  │  │  │    - ALB Nodes                       │      │   │    │
│  │  │  └──────────────────────────────────────┘      │   │    │
│  │  │                                                 │   │    │
│  │  │  ┌──────────────────────────────────────┐      │   │    │
│  │  │  │  Private Subnet App (10.0.4.0/24)    │      │   │    │
│  │  │  │    ┌─────────────────────────┐       │      │   │    │
│  │  │  │    │  EKS Node Group 2       │       │      │   │    │
│  │  │  │    │  - Server Pods          │       │      │   │    │
│  │  │  │    │  - Worker Pods          │       │      │   │    │
│  │  │  │    │  (t3.large)             │       │      │   │    │
│  │  │  │    └─────────────────────────┘       │      │   │    │
│  │  │  └──────────────────────────────────────┘      │   │    │
│  │  │                                                 │   │    │
│  │  │  ┌──────────────────────────────────────┐      │   │    │
│  │  │  │  Private Subnet Data (10.0.6.0/24)   │      │   │    │
│  │  │  │    - RDS PostgreSQL (Standby)        │      │   │    │
│  │  │  │    - ElastiCache Redis (Replica)     │      │   │    │
│  │  │  └──────────────────────────────────────┘      │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Serviços Adicionais                    │    │
│  │                                                         │    │
│  │  • S3 Buckets (Storage de arquivos)                    │    │
│  │  • ECR (Container Registry)                            │    │
│  │  • CloudWatch (Logs & Metrics)                         │    │
│  │  • Secrets Manager (Credenciais)                       │    │
│  │  • IAM Roles & Policies                                │    │
│  │  • AWS Backup (Backups automatizados)                  │    │
│  │  • KMS (Encryption Keys)                               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Componentes da Infraestrutura

### 1. Amazon EKS (Elastic Kubernetes Service)
- **Versão**: 1.28 ou superior
- **Control Plane**: Gerenciado pela AWS
- **Node Groups**:
  - 2-3 nodes mínimo (multi-AZ)
  - Instance type: `t3.large` (2 vCPU, 8GB RAM) para começar
  - Auto Scaling Group configurado
  - Spot Instances para ambientes de dev/staging

### 2. Amazon RDS PostgreSQL
- **Versão**: PostgreSQL 16
- **Instance Class**: `db.t3.medium` (início) → `db.r6g.large` (produção)
- **Multi-AZ**: ✅ Habilitado para HA
- **Storage**: 100GB GP3 (escalável)
- **Backup**: Diário com retenção de 7 dias
- **Read Replicas**: Opcional para cargas pesadas de leitura

**Por que não usar PostgreSQL no Kubernetes?**
- RDS oferece backups automáticos
- Patches e manutenção gerenciados
- Multi-AZ para alta disponibilidade
- Menor risco de perda de dados

### 3. Amazon ElastiCache Redis
- **Engine**: Redis 7.x
- **Node Type**: `cache.t3.medium` (início)
- **Cluster Mode**: Habilitado para escalabilidade
- **Multi-AZ**: ✅ Com réplicas de leitura
- **Snapshots**: Diários

**Por que não usar Redis no Kubernetes?**
- Persistência e failover automáticos
- Patches gerenciados
- Performance otimizada

### 4. Amazon S3
**Buckets necessários:**
- `ninetwo-prod-storage`: Arquivos de usuários
- `ninetwo-prod-backups`: Backups do banco
- `ninetwo-prod-logs`: Logs da aplicação

**Configurações:**
- Versionamento habilitado
- Lifecycle policies (mover para Glacier após 90 dias)
- Encryption at rest (SSE-S3 ou KMS)
- Block Public Access habilitado

### 5. Amazon ECR (Elastic Container Registry)
**Repositórios:**
- `ninetwo/server`: Imagens do backend
- `ninetwo/front`: Imagens do frontend

### 6. Application Load Balancer (ALB)
- **Tipo**: Application Load Balancer
- **Scheme**: Internet-facing
- **SSL/TLS**: Certificate Manager (ACM)
- **Target Groups**:
  - Server (porta 3000)
  - Health checks configurados

### 7. VPC (Virtual Private Cloud)
**Subnets:**
- Public Subnets (2 AZs): ALB, NAT Gateways
- Private Subnets App (2 AZs): EKS Nodes
- Private Subnets Data (2 AZs): RDS, ElastiCache

**Security Groups:**
- ALB → EKS Nodes (porta 3000)
- EKS Nodes → RDS (porta 5432)
- EKS Nodes → ElastiCache (porta 6379)
- Deny all por padrão

### 8. Route 53
- Hosted Zone para o domínio
- Alias record apontando para o ALB
- Health checks opcionais

### 9. CloudFront (Opcional mas Recomendado)
- CDN para assets estáticos
- Cache de conteúdo
- Proteção DDoS básica
- Redução de latência global

### 10. Secrets Manager
**Secrets armazenados:**
- Database credentials
- Redis URL
- JWT tokens
- API keys (Google, OAuth, etc.)
- App secrets

---

## Estimativa de Custos

### Ambiente de Produção (Carga Média)

| Serviço | Especificação | Custo Mensal (USD) |
|---------|--------------|-------------------|
| **EKS Control Plane** | 1 cluster | $72 |
| **EKS Nodes** | 2x t3.large (us-east-1) | ~$120 |
| **RDS PostgreSQL** | db.t3.medium Multi-AZ | ~$120 |
| **ElastiCache Redis** | cache.t3.medium | ~$80 |
| **ALB** | 1 load balancer + tráfego | ~$25 |
| **NAT Gateway** | 2 NAT Gateways (Multi-AZ) | ~$90 |
| **S3** | 100GB storage + requests | ~$10 |
| **ECR** | 10GB images | ~$1 |
| **CloudWatch** | Logs e métricas | ~$20 |
| **Route 53** | 1 hosted zone | ~$1 |
| **Secrets Manager** | 10 secrets | ~$4 |
| **Data Transfer** | Estimativa | ~$30 |
| **Backups (AWS Backup)** | Snapshots | ~$15 |

**Total Estimado: ~$588/mês**

### Otimizações de Custo

1. **Usar Spot Instances** nos EKS nodes (economia de até 70%)
2. **Savings Plans** para EKS e RDS (até 40% desconto)
3. **Single-AZ para dev/staging** (reduz custos pela metade)
4. **S3 Intelligent-Tiering** para otimizar storage
5. **CloudWatch Logs com retenção de 7 dias** (vs. indefinido)

### Ambiente de Desenvolvimento/Staging (~$250/mês)
- Single AZ
- Instâncias menores (t3.small)
- Sem ElastiCache (Redis no K8s)
- Sem NAT Gateway redundante

---

## Guia de Implementação Passo a Passo

### Pré-requisitos
```bash
# Instalar ferramentas necessárias
brew install awscli terraform kubectl eksctl helm

# Configurar credenciais AWS
aws configure

# Verificar
aws sts get-caller-identity
```

### Passo 1: Criar a Infraestrutura com Terraform

#### 1.1. Estrutura de Diretórios
```
ninetwo/
├── terraform/
│   ├── modules/
│   │   ├── vpc/
│   │   ├── eks/
│   │   ├── rds/
│   │   ├── elasticache/
│   │   ├── s3/
│   │   └── security/
│   ├── environments/
│   │   ├── prod/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── terraform.tfvars
│   │   └── staging/
│   ├── backend.tf
│   └── providers.tf
```

#### 1.2. Terraform Backend (terraform/backend.tf)
```hcl
terraform {
  backend "s3" {
    bucket         = "ninetwo-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ninetwo-terraform-locks"
  }
}
```

#### 1.3. Criar VPC
```hcl
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "ninetwo-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24"]

  enable_nat_gateway   = true
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = "production"
    Project     = "ninetwo"
  }
}
```

#### 1.4. Criar EKS Cluster
```hcl
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "ninetwo-eks"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # EKS Managed Node Groups
  eks_managed_node_groups = {
    main = {
      min_size     = 2
      max_size     = 4
      desired_size = 2

      instance_types = ["t3.large"]
      capacity_type  = "ON_DEMAND" # ou "SPOT" para economia

      labels = {
        Environment = "production"
        NodeGroup   = "main"
      }

      tags = {
        Name = "ninetwo-eks-node"
      }
    }
  }

  # Cluster addons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }
}
```

#### 1.5. Criar RDS PostgreSQL
```hcl
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "ninetwo-postgres"

  engine               = "postgres"
  engine_version       = "16.1"
  family               = "postgres16"
  major_engine_version = "16"
  instance_class       = "db.t3.medium"

  allocated_storage     = 100
  max_allocated_storage = 500
  storage_encrypted     = true

  db_name  = "ninetwo"
  username = "ninetwo_admin"
  port     = 5432

  multi_az               = true
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  deletion_protection = true

  tags = {
    Environment = "production"
  }
}
```

#### 1.6. Criar ElastiCache Redis
```hcl
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "ninetwo-redis"
  replication_group_description = "Redis for NineTwo"

  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.medium"
  number_cache_clusters = 2
  parameter_group_name = "default.redis7"
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]

  automatic_failover_enabled = true
  multi_az_enabled          = true

  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"

  tags = {
    Environment = "production"
  }
}
```

#### 1.7. Criar S3 Buckets
```hcl
module "s3_storage" {
  source = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.0"

  bucket = "ninetwo-prod-storage"

  versioning = {
    enabled = true
  }

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  lifecycle_rule = [
    {
      id      = "archive-old-files"
      enabled = true

      transition = [
        {
          days          = 90
          storage_class = "GLACIER"
        }
      ]
    }
  ]

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  tags = {
    Environment = "production"
  }
}
```

### Passo 2: Deploy da Aplicação no EKS

#### 2.1. Configurar kubectl
```bash
# Atualizar kubeconfig
aws eks update-kubeconfig --region us-east-1 --name ninetwo-eks

# Verificar conexão
kubectl get nodes
```

#### 2.2. Instalar AWS Load Balancer Controller
```bash
# Adicionar repo Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Instalar
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=ninetwo-eks \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller
```

#### 2.3. Criar Namespace e Secrets
```bash
# Criar namespace
kubectl create namespace ninetwo

# Criar secrets do Secrets Manager
kubectl create secret generic ninetwo-secrets \
  --from-literal=DATABASE_URL="postgres://user:pass@rds-endpoint:5432/ninetwo" \
  --from-literal=REDIS_URL="redis://elasticache-endpoint:6379" \
  --from-literal=APP_SECRET="your-secret-here" \
  --namespace=ninetwo
```

#### 2.4. Adaptar os Manifestos K8s Existentes

**Deployment Server (deployment-server.yaml)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ninetwo-server
  namespace: ninetwo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ninetwo-server
  template:
    metadata:
      labels:
        app: ninetwo-server
    spec:
      serviceAccountName: ninetwo-sa
      containers:
      - name: server
        image: <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/ninetwo/server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PG_DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ninetwo-secrets
              key: DATABASE_URL
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: ninetwo-secrets
              key: REDIS_URL
        - name: STORAGE_TYPE
          value: "s3"
        - name: STORAGE_S3_REGION
          value: "us-east-1"
        - name: STORAGE_S3_NAME
          value: "ninetwo-prod-storage"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

**Service com ALB (service-server.yaml)**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: ninetwo-server
  namespace: ninetwo
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "external"
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: "ip"
    service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
spec:
  type: LoadBalancer
  selector:
    app: ninetwo-server
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

**Ingress com ALB (ingress.yaml)**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ninetwo-ingress
  namespace: ninetwo
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/healthcheck-path: /healthz
spec:
  ingressClassName: alb
  rules:
  - host: app.ninetwo.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ninetwo-server
            port:
              number: 80
```

#### 2.5. Deploy
```bash
# Aplicar os manifestos
kubectl apply -f k8s/namespaces/
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress/

# Verificar status
kubectl get pods -n ninetwo
kubectl get svc -n ninetwo
kubectl get ingress -n ninetwo

# Verificar logs
kubectl logs -f deployment/ninetwo-server -n ninetwo
```

### Passo 3: Configurar CI/CD

#### 3.1. GitHub Actions para Build e Deploy

**.github/workflows/deploy-prod.yml**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  EKS_CLUSTER: ninetwo-eks
  ECR_REPOSITORY_SERVER: ninetwo/server
  ECR_REPOSITORY_FRONT: ninetwo/front

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push server image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_SERVER:$IMAGE_TAG \
          -f packages/ninetwo-docker/twenty/Dockerfile .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY_SERVER:$IMAGE_TAG
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY_SERVER:$IMAGE_TAG \
          $ECR_REGISTRY/$ECR_REPOSITORY_SERVER:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY_SERVER:latest

    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER

    - name: Deploy to EKS
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        kubectl set image deployment/ninetwo-server \
          server=$ECR_REGISTRY/$ECR_REPOSITORY_SERVER:$IMAGE_TAG \
          -n ninetwo

        kubectl rollout status deployment/ninetwo-server -n ninetwo

    - name: Run migrations
      run: |
        kubectl exec -it deployment/ninetwo-server -n ninetwo -- \
          yarn database:migrate:prod
```

---

## Monitoramento e Observabilidade

### 1. Amazon CloudWatch
```bash
# Instalar CloudWatch Container Insights
kubectl apply -f https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonset/container-insights-monitoring/quickstart/cwagent-fluentd-quickstart.yaml
```

**Métricas importantes:**
- CPU e memória por pod
- Network I/O
- Disk I/O
- Request latency
- Error rates

### 2. Prometheus + Grafana (Opcional)
```bash
# Adicionar repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Instalar stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```

### 3. Logs Centralizados
```bash
# FluentBit para shipping de logs
helm repo add fluent https://fluent.github.io/helm-charts
helm install fluent-bit fluent/fluent-bit \
  --namespace logging --create-namespace \
  --set cloudWatch.enabled=true \
  --set cloudWatch.region=us-east-1 \
  --set cloudWatch.logGroupName=/aws/eks/ninetwo
```

### 4. Alertas CloudWatch
```hcl
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "ninetwo-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EKS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors EKS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

---

## Segurança

### 1. IAM Roles for Service Accounts (IRSA)
```hcl
# Permite pods acessarem S3 sem credenciais hardcoded
module "irsa_s3" {
  source = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"

  role_name = "ninetwo-s3-access"

  attach_external_secrets_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["ninetwo:ninetwo-sa"]
    }
  }
}
```

**ServiceAccount no K8s:**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ninetwo-sa
  namespace: ninetwo
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT:role/ninetwo-s3-access
```

### 2. Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ninetwo-server-policy
  namespace: ninetwo
spec:
  podSelector:
    matchLabels:
      app: ninetwo-server
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: alb-ingress-controller
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
  - to:
    - podSelector: {} # Allow to RDS/ElastiCache
    ports:
    - protocol: TCP
      port: 5432
    - protocol: TCP
      port: 6379
```

### 3. Pod Security Standards
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ninetwo
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### 4. Secrets Encryption
```bash
# Habilitar encryption de secrets no EKS
aws eks associate-encryption-config \
  --cluster-name ninetwo-eks \
  --encryption-config \
    '[{"resources":["secrets"],"provider":{"keyArn":"arn:aws:kms:us-east-1:ACCOUNT:key/KEY-ID"}}]'
```

### 5. WAF (Web Application Firewall)
```hcl
resource "aws_wafv2_web_acl" "ninetwo" {
  name  = "ninetwo-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimitRule"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "ninetwo-waf"
    sampled_requests_enabled   = true
  }
}
```

---

## Backup e Disaster Recovery

### 1. AWS Backup para RDS
```hcl
resource "aws_backup_plan" "ninetwo" {
  name = "ninetwo-backup-plan"

  rule {
    rule_name         = "daily_backup"
    target_vault_name = aws_backup_vault.ninetwo.name
    schedule          = "cron(0 3 * * ? *)" # 3 AM daily

    lifecycle {
      delete_after = 30
    }
  }

  rule {
    rule_name         = "weekly_backup"
    target_vault_name = aws_backup_vault.ninetwo.name
    schedule          = "cron(0 3 ? * 1 *)" # 3 AM Sunday

    lifecycle {
      delete_after = 90
    }
  }
}

resource "aws_backup_selection" "ninetwo_rds" {
  name         = "ninetwo-rds-backup"
  plan_id      = aws_backup_plan.ninetwo.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = [
    module.rds.db_instance_arn
  ]
}
```

### 2. Velero para Backup do K8s
```bash
# Instalar Velero CLI
brew install velero

# Configurar Velero no cluster
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.8.0 \
  --bucket ninetwo-velero-backups \
  --backup-location-config region=us-east-1 \
  --snapshot-location-config region=us-east-1 \
  --secret-file ./credentials-velero

# Criar backup schedule
velero schedule create ninetwo-daily \
  --schedule="0 3 * * *" \
  --include-namespaces ninetwo \
  --ttl 720h
```

### 3. Disaster Recovery Plan

**RPO (Recovery Point Objective)**: 1 hora
**RTO (Recovery Time Objective)**: 4 horas

**Procedimento de Recuperação:**

1. **Recuperar RDS:**
```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ninetwo-postgres-restored \
  --db-snapshot-identifier rds:ninetwo-postgres-2024-01-15-03-00
```

2. **Recuperar ElastiCache:**
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id ninetwo-redis-restored \
  --snapshot-name ninetwo-redis-backup-2024-01-15
```

3. **Recuperar aplicação K8s:**
```bash
velero restore create --from-backup ninetwo-daily-20240115030000
```

4. **Atualizar DNS:**
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://update-dns.json
```

---

## Otimizações de Performance

### 1. Auto Scaling

**Horizontal Pod Autoscaler (HPA):**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ninetwo-server-hpa
  namespace: ninetwo
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ninetwo-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Cluster Autoscaler:**
```bash
# Configurar Cluster Autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# Anotar deployment
kubectl -n kube-system annotate deployment.apps/cluster-autoscaler \
  cluster-autoscaler.kubernetes.io/safe-to-evict="false"
```

### 2. Caching com CloudFront
```hcl
resource "aws_cloudfront_distribution" "ninetwo" {
  enabled = true
  aliases = ["app.ninetwo.com"]

  origin {
    domain_name = aws_lb.ninetwo_alb.dns_name
    origin_id   = "ALB"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "ALB"

    forwarded_values {
      query_string = true
      headers      = ["Host", "Authorization"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.ninetwo.arn
    ssl_support_method  = "sni-only"
  }
}
```

### 3. Read Replicas RDS
```hcl
resource "aws_db_instance" "read_replica" {
  identifier             = "ninetwo-postgres-read-replica"
  replicate_source_db    = module.rds.db_instance_id
  instance_class         = "db.t3.medium"
  auto_minor_version_upgrade = false
  publicly_accessible    = false
  skip_final_snapshot    = true

  tags = {
    Name = "ninetwo-read-replica"
  }
}
```

---

## Checklist de Go-Live

### Pré-Deploy
- [ ] Terraform validado e aplicado em staging
- [ ] Certificado SSL configurado no ACM
- [ ] DNS configurado no Route 53
- [ ] Secrets criados no Secrets Manager
- [ ] IAM roles configurados
- [ ] Security Groups validados
- [ ] Backups configurados
- [ ] Monitoramento e alertas ativos

### Deploy
- [ ] Imagens Docker buildadas e pushed para ECR
- [ ] Migrations testadas
- [ ] Health checks funcionando
- [ ] Load balancer configurado
- [ ] Auto scaling testado
- [ ] Logs sendo coletados

### Pós-Deploy
- [ ] Smoke tests executados
- [ ] Performance baseline estabelecida
- [ ] Documentação atualizada
- [ ] Equipe treinada
- [ ] Runbook criado para incidentes
- [ ] Disaster recovery testado

---

## Troubleshooting Comum

### Pods não iniciam
```bash
# Verificar eventos
kubectl describe pod <pod-name> -n ninetwo

# Verificar logs
kubectl logs <pod-name> -n ninetwo --previous

# Verificar resources
kubectl top pods -n ninetwo
```

### Problemas de conectividade com RDS
```bash
# Testar conectividade do pod
kubectl run -it --rm debug --image=postgres:16 --restart=Never -n ninetwo -- \
  psql -h <RDS_ENDPOINT> -U ninetwo_admin -d ninetwo

# Verificar security groups
aws ec2 describe-security-groups --group-ids <SG_ID>
```

### ALB não roteia tráfego
```bash
# Verificar target health
aws elbv2 describe-target-health --target-group-arn <TG_ARN>

# Verificar ingress
kubectl describe ingress ninetwo-ingress -n ninetwo
```

---

## Recursos Adicionais

- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Terraform AWS Modules](https://registry.terraform.io/namespaces/terraform-aws-modules)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Twenty CRM Docs](https://docs.twenty.com/)

---

## Conclusão

Esta arquitetura fornece:
- **Alta disponibilidade** com Multi-AZ
- **Escalabilidade** automática
- **Segurança** em camadas
- **Observabilidade** completa
- **Disaster recovery** robusto

**Próximos passos recomendados:**
1. Implementar em ambiente de staging primeiro
2. Realizar testes de carga
3. Configurar WAF e CloudFront
4. Implementar CI/CD completo
5. Treinar equipe em operações K8s/AWS

---

**Mantido por**: Equipe NineTwo
**Última atualização**: Janeiro 2025
**Versão**: 1.0
