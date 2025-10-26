# 🚀 Guia de Deploy na AWS EC2

## 📋 Pré-requisitos
- Conta AWS ativa
- Cartão de crédito cadastrado

## 🖥️ Passo 1: Criar Instância EC2

1. **Acesse o Console AWS:**
   - Vá para: https://console.aws.amazon.com/ec2/
   - Região: **São Paulo (sa-east-1)** ou **N. Virginia (us-east-1)**

2. **Clique em "Launch Instance"**

3. **Configurações da Instância:**
   - **Name**: `ninetwo-dev`
   - **OS**: **Ubuntu Server 22.04 LTS**
   - **Instance type**: **t3.large** (2 vCPU, 8GB RAM)
     - Se aparecer "Free tier eligible", escolha t2.micro para teste grátis
   - **Key pair**: 
     - Clique em "Create new key pair"
     - Nome: `ninetwo-key`
     - Type: RSA
     - Format: `.pem`
     - **BAIXE O ARQUIVO** `ninetwo-key.pem` e guarde em local seguro!

4. **Network Settings:**
   - Clique em "Edit"
   - **Firewall (Security Group):**
     - Nome: `ninetwo-sg`
     - Descrição: `NineTwo development server`
   - **Inbound Rules** (adicione TODAS):
     ```
     Type            | Port Range | Source
     ----------------|------------|--------
     SSH             | 22         | My IP (seu IP)
     Custom TCP      | 3000       | 0.0.0.0/0
     Custom TCP      | 3001       | 0.0.0.0/0
     PostgreSQL      | 5432       | My IP
     Redis           | 6379       | My IP
     Kafka           | 9092       | My IP
     Kafka           | 29092      | My IP
     Couchbase       | 8091-8096  | My IP
     Couchbase       | 11210      | My IP
     ```

5. **Storage:**
   - **Size**: 30 GB (mínimo)
   - Recomendado: **50 GB** para conforto
   - Type: gp3

6. **Clique em "Launch Instance"**

7. **Aguarde 2-3 minutos** até o estado ser "Running"

## 🔌 Passo 2: Conectar na Instância

### No seu terminal local:

```bash
# 1. Dar permissão correta ao arquivo .pem
chmod 400 ~/Downloads/ninetwo-key.pem

# 2. Pegar o IP público da instância
# Vá no console AWS EC2 > Instances > clique na instância > copie "Public IPv4 address"

# 3. Conectar via SSH (substitua SEU_IP_PUBLICO)
ssh -i ~/Downloads/ninetwo-key.pem ubuntu@SEU_IP_PUBLICO
```

## 🛠️ Passo 3: Executar Setup Automático

**Na instância EC2, rode:**

```bash
# 1. Baixar o script de setup
wget https://raw.githubusercontent.com/eumoitinho/ninetwo/main/aws-setup.sh

# 2. Dar permissão de execução
chmod +x aws-setup.sh

# 3. Executar (vai levar ~15 minutos)
./aws-setup.sh
```

**O script vai:**
- ✅ Instalar Node.js 24.x
- ✅ Instalar Docker
- ✅ Subir PostgreSQL, Redis, Kafka e Couchbase (Docker)
- ✅ Clonar o repositório
- ✅ Instalar dependências do projeto
- ✅ Compilar servidor e frontend

## ⚙️ Passo 4: Configurar Credenciais

```bash
cd /home/ubuntu/ninetwo
nano .env

# Edite as seguintes variáveis com suas credenciais reais:
GOOGLE_CLIENT_ID=seu-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
GOOGLE_ADS_DEVELOPER_TOKEN=seu-dev-token-aqui

# Salvar: Ctrl+O, Enter, Ctrl+X
```

## 🚀 Passo 5: Iniciar Aplicação

```bash
# Opção 1: Com logs visíveis (recomendado para primeiro teste)
yarn nx run-many -t start -p ninetwo-server ninetwo-front

# Opção 2: Em background (para deixar rodando)
nohup yarn nx run-many -t start -p ninetwo-server ninetwo-front > app.log 2>&1 &
```

## 🌐 Acessar a Aplicação

Substitua `SEU_IP_PUBLICO` pelo IP da sua instância:

- **Frontend:** http://SEU_IP_PUBLICO:3001
- **Backend API:** http://SEU_IP_PUBLICO:3000
- **Couchbase UI:** http://SEU_IP_PUBLICO:8091
  - User: `Administrator`
  - Password: `password`

## 💻 Passo 6: VS Code Remote (Desenvolvimento)

### Instalar extensão Remote SSH:
1. Abra VS Code
2. Vá em Extensions (Ctrl+Shift+X)
3. Procure "Remote - SSH"
4. Instale

### Configurar conexão:
1. Pressione `F1` ou `Ctrl+Shift+P`
2. Digite: "Remote-SSH: Connect to Host..."
3. Clique em "+ Add New SSH Host"
4. Digite: `ssh -i ~/Downloads/ninetwo-key.pem ubuntu@SEU_IP_PUBLICO`
5. Selecione o arquivo de config (geralmente `~/.ssh/config`)
6. Clique em "Connect"

**Pronto! Agora você pode desenvolver diretamente na EC2 pelo VS Code!**

## 🔍 Verificar Serviços

```bash
# Ver logs do Docker
docker ps
docker logs ninetwo-postgres
docker logs ninetwo-kafka
docker logs ninetwo-couchbase

# Ver logs da aplicação (se rodou em background)
tail -f /home/ubuntu/ninetwo/app.log

# Verificar se portas estão abertas
netstat -tulpn | grep -E '3000|3001|5432|6379|9092|8091'
```

## 📊 Monitoramento de Recursos

```bash
# Ver uso de CPU/RAM
htop

# Ver uso de disco
df -h

# Ver logs do sistema
journalctl -f
```

## 🛑 Parar Aplicação

```bash
# Se rodou em primeiro plano: Ctrl+C

# Se rodou em background:
pkill -f "nx run"
```

## 💰 Custos Estimados (AWS)

| Recurso | Especificação | Custo/mês (USD) |
|---------|---------------|-----------------|
| EC2 t3.large | 2 vCPU, 8GB RAM | ~$60 |
| Storage (50GB) | gp3 | ~$5 |
| Transfer Out | 100GB/mês | ~$9 |
| **TOTAL** | | **~$74/mês** |

💡 **Dica:** Use t2.micro (free tier) para testes iniciais!

## 🆘 Troubleshooting

### Erro: "Permission denied (publickey)"
```bash
# Verifique permissões do arquivo .pem
ls -l ~/Downloads/ninetwo-key.pem
# Deve mostrar: -r-------- (400)

# Se não, corrija:
chmod 400 ~/Downloads/ninetwo-key.pem
```

### Erro: "Connection timeout"
- Verifique o Security Group
- Confirme que seu IP está liberado
- Teste: `ping SEU_IP_PUBLICO`

### Serviços não sobem (Docker)
```bash
# Reiniciar Docker
sudo systemctl restart docker

# Ver logs detalhados
docker logs ninetwo-postgres --tail 100
```

### Porta já em uso
```bash
# Ver o que está usando a porta
sudo lsof -i :3000

# Matar processo
sudo kill -9 PID
```

## 🎯 Próximos Passos

Após tudo funcionando:
1. Configure domínio customizado (Route 53)
2. Configure SSL/HTTPS (Let's Encrypt)
3. Configure backup automático (AWS Backup)
4. Configure CloudWatch para monitoramento

---

**Dúvidas?** Qualquer problema, me chama! 🚀

