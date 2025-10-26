# 🚀 Setup NineTwo na AWS EC2

## Passo 1: Fazer Push do Código

```bash
cd /home/moitinho/Documents/Projetos/ninetwo
git push origin main
# Se pedir credenciais, use seu token do GitHub
```

## Passo 2: Criar Instância EC2

### 2.1 Acessar AWS Console
- Acesse: https://console.aws.amazon.com/ec2
- Região: **us-east-1** (ou sua região preferida)

### 2.2 Launch Instance
1. Clique em **"Launch Instance"**
2. **Name:** `ninetwo-dev`
3. **Application and OS Images:**
   - **Ubuntu Server 22.04 LTS**
   - 64-bit (x86)

4. **Instance type:**
   - Selecione: **t3.large** (2 vCPU, 8 GB RAM)
   - Custo: ~$60/mês

5. **Key pair:**
   - Clique em **"Create new key pair"**
   - Name: `ninetwo-key`
   - Type: RSA
   - Format: `.pem` (para Linux/Mac)
   - **BAIXE E SALVE** o arquivo `ninetwo-key.pem`

6. **Network settings:**
   - Clique em **"Edit"**
   - **Security group name:** `ninetwo-sg`
   - Adicione as seguintes regras:

   | Type | Protocol | Port | Source | Description |
   |------|----------|------|--------|-------------|
   | SSH | TCP | 22 | My IP | SSH access |
   | Custom TCP | TCP | 3000 | 0.0.0.0/0 | NineTwo Backend |
   | Custom TCP | TCP | 3001 | 0.0.0.0/0 | NineTwo Frontend |
   | Custom TCP | TCP | 8091 | My IP | Couchbase UI |
   | Custom TCP | TCP | 5432 | My IP | PostgreSQL (debug) |
   | Custom TCP | TCP | 6379 | My IP | Redis (debug) |

7. **Configure storage:**
   - **50 GB** gp3 (SSD)

8. **Advanced details:**
   - Mantenha padrão

9. Clique em **"Launch instance"**

## Passo 3: Conectar via SSH

### 3.1 Preparar a key
```bash
# Mover a key para ~/.ssh
mkdir -p ~/.ssh
mv ~/Downloads/ninetwo-key.pem ~/.ssh/
chmod 400 ~/.ssh/ninetwo-key.pem
```

### 3.2 Conectar
```bash
# Substituir PUBLIC_IP pelo IP da sua instância (aparece no console AWS)
ssh -i ~/.ssh/ninetwo-key.pem ubuntu@PUBLIC_IP
```

## Passo 4: Executar Setup na EC2

### 4.1 Fazer upload do script
```bash
# No SEU computador (nova aba do terminal):
scp -i ~/.ssh/ninetwo-key.pem /home/moitinho/Documents/Projetos/ninetwo/aws-setup.sh ubuntu@PUBLIC_IP:~/
```

### 4.2 Executar o script
```bash
# Dentro da EC2 (via SSH):
chmod +x ~/aws-setup.sh
./aws-setup.sh
```

**⏳ Aguarde 10-15 minutos** - O script vai:
- Instalar Node.js, Docker, Kafka, Couchbase
- Clonar o repositório
- Instalar dependências
- Fazer build do projeto

### 4.3 Configurar credenciais do Google

```bash
# Editar .env na EC2:
cd ~/ninetwo
nano .env

# Adicione suas credenciais:
GOOGLE_CLIENT_ID=seu-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-secret-aqui
GOOGLE_ADS_DEVELOPER_TOKEN=seu-token-aqui
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

## Passo 5: Iniciar o Projeto

```bash
cd ~/ninetwo

# Iniciar todos os serviços
yarn nx run-many -t start -p ninetwo-server ninetwo-front &

# Ver logs
tail -f nohup.out
```

## Passo 6: Acessar o Sistema

Abra no navegador:
- **Frontend:** `http://PUBLIC_IP:3001`
- **Backend:** `http://PUBLIC_IP:3000`
- **Couchbase UI:** `http://PUBLIC_IP:8091`
  - User: `Administrator`
  - Password: `password`

## Passo 7: Configurar VS Code Remote SSH

### 7.1 Instalar extensão
- No VS Code, instale: **Remote - SSH**

### 7.2 Configurar SSH
1. `Ctrl+Shift+P` → "Remote-SSH: Open SSH Configuration File"
2. Adicione:

```
Host ninetwo-aws
    HostName PUBLIC_IP
    User ubuntu
    IdentityFile ~/.ssh/ninetwo-key.pem
```

3. `Ctrl+Shift+P` → "Remote-SSH: Connect to Host"
4. Selecione `ninetwo-aws`
5. Abra a pasta: `/home/ubuntu/ninetwo`

## 🎯 Comandos Úteis

```bash
# Ver logs do Docker
docker compose logs -f kafka
docker compose logs -f couchbase

# Reiniciar serviços
cd ~/ninetwo
docker compose restart kafka

# Ver uso de recursos
htop

# Parar tudo
docker compose down
pkill -f "nx run"

# Iniciar novamente
docker compose up -d
cd ~/ninetwo
yarn nx run-many -t start -p ninetwo-server ninetwo-front &
```

## 🚨 Troubleshooting

### Erro de memória
```bash
# Aumentar swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Kafka não inicia
```bash
docker compose restart zookeeper
sleep 10
docker compose restart kafka
```

### Couchbase não responde
```bash
docker compose restart couchbase
sleep 30
# Recriar buckets se necessário
```

## 💰 Custos Estimados

| Serviço | Configuração | Custo/mês |
|---------|-------------|-----------|
| EC2 t3.large | 2 vCPU, 8GB RAM | $60 |
| EBS 50GB | gp3 SSD | $4 |
| Data Transfer | ~100GB | $10 |
| **TOTAL** | | **~$74/mês** |

## 🎉 Próximos Passos

Depois do setup:
1. ✅ Testar integração Google Ads
2. ✅ Testar integração Google Analytics
3. ✅ Verificar Kafka topics
4. ✅ Verificar dados no Couchbase
5. ✅ Implementar consumers Kafka → Couchbase

---

**Dúvidas?** Qualquer erro, me mande o log!

