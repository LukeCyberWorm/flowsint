# 🆘 Guia de Emergência - VPS Parada

## 🚨 SITUAÇÃO CRÍTICA

Seu sistema completo está hospedado na VPS `31.97.83.205` e ela parou de funcionar.

---

## ⚡ AÇÃO IMEDIATA (Execute AGORA)

### 1. Execute o diagnóstico automático
```powershell
cd C:\Users\Platzeck\Desktop\flowsint
.\diagnose-vps.ps1
```

Esse script vai identificar automaticamente o problema.

---

### 2. Se o diagnóstico identificar o problema, execute a recuperação
```powershell
.\recover-vps.ps1
```

Esse script vai tentar restaurar todos os serviços automaticamente.

---

## 🔍 CAUSAS MAIS COMUNS E SOLUÇÕES

### ❌ Problema 1: Disco Cheio (90%+)
**Sintomas:**
- Containers não iniciam
- Banco de dados trava
- Sistema lento

**Solução:**
```bash
ssh root@31.97.83.205

# Ver uso de disco
df -h

# Limpar logs antigos
journalctl --vacuum-time=7d
docker system prune -a --volumes  # ⚠️ CUIDADO: apaga volumes não utilizados

# Liberar espaço manualmente
rm -rf /var/log/*.log.1
rm -rf /tmp/*
```

---

### ❌ Problema 2: Memória RAM Esgotada
**Sintomas:**
- Containers crasham
- VPS trava
- Processos matam uns aos outros (OOM Killer)

**Solução:**
```bash
ssh root@31.97.83.205

# Ver uso de memória
free -h
htop

# Reiniciar containers um por um (economiza RAM)
docker restart flowsint-postgres-prod
sleep 30
docker restart flowsint-redis-prod
sleep 10
docker restart flowsint-neo4j-prod
sleep 30
docker restart flowsint-api-prod
sleep 10
docker restart flowsint-celery-prod
```

**Solução Permanente:**
- Upgrade da VPS (mais RAM)
- Otimizar consumo de memória dos containers
- Adicionar SWAP

---

### ❌ Problema 3: Docker Daemon Parado
**Sintomas:**
- `docker ps` não funciona
- Containers não respondem

**Solução:**
```bash
ssh root@31.97.83.205

# Verificar status
systemctl status docker

# Reiniciar Docker
systemctl restart docker

# Subir containers
cd /root/flowsint
docker-compose -f docker-compose.prod.yml up -d
```

---

### ❌ Problema 4: Banco de Dados Corrompido
**Sintomas:**
- API retorna erros 500
- Logs mostram "connection refused" ao PostgreSQL

**Solução:**
```bash
ssh root@31.97.83.205

# Ver logs do PostgreSQL
docker logs flowsint-postgres-prod

# Tentar reiniciar
docker restart flowsint-postgres-prod

# Se não funcionar, verificar backups
# (⚠️ CRÍTICO: você tem backups configurados?)
```

---

### ❌ Problema 5: Nginx Parado
**Sintomas:**
- Sites não carregam (ERR_CONNECTION_REFUSED)
- API não responde externamente

**Solução:**
```bash
ssh root@31.97.83.205

# Verificar status
systemctl status nginx

# Testar configuração
nginx -t

# Reiniciar
systemctl restart nginx

# Ver logs de erro
tail -f /var/log/nginx/error.log
```

---

### ❌ Problema 6: Certificado SSL Expirado
**Sintomas:**
- Navegador mostra "Sua conexão não é privada"
- HTTPS não funciona

**Solução:**
```bash
ssh root@31.97.83.205

# Verificar expiração
certbot certificates

# Renovar certificados
certbot renew

# Reiniciar Nginx
systemctl reload nginx
```

---

### ❌ Problema 7: VPS Totalmente Travada
**Sintomas:**
- Não responde ao ping
- SSH não conecta
- Timeout em todas as requisições

**Solução:**
1. **Acesse o painel da hospedagem** (Contabo, DigitalOcean, Hetzner, etc.)
2. **Reinicie a VPS** pelo painel
3. **Aguarde 2-3 minutos**
4. **Tente conectar:** `ssh root@31.97.83.205`
5. **Suba os containers:** `cd /root/flowsint && docker-compose -f docker-compose.prod.yml up -d`

---

## 📊 MONITORAMENTO CONTÍNUO

Após restaurar, execute estes comandos para monitorar:

```bash
# Conectar na VPS
ssh root@31.97.83.205

# Ver status dos containers em tempo real
watch -n 2 'docker ps --format "table {{.Names}}\t{{.Status}}"'

# Monitorar uso de recursos
htop

# Ver logs da API em tempo real
docker logs flowsint-api-prod -f

# Ver logs de todos os containers
docker-compose -f /root/flowsint/docker-compose.prod.yml logs -f
```

---

## 🛡️ PREVENÇÃO FUTURA

### 1. Configure Backups Automáticos
```bash
# Backup do banco de dados diário
crontab -e

# Adicione esta linha (backup às 3h da manhã):
0 3 * * * docker exec flowsint-postgres-prod pg_dump -U flowsint flowsint > /root/backups/db-$(date +\%Y\%m\%d).sql
```

### 2. Configure Monitoramento
- **UptimeRobot** (grátis): monitora se o site está no ar
- **Netdata**: monitora recursos da VPS
- **Alertas por email** quando serviços caem

### 3. Limpeza Automática de Logs
```bash
# Adicione ao crontab
0 2 * * 0 docker system prune -f
0 2 * * 0 journalctl --vacuum-time=7d
```

---

## 🆘 ÚLTIMO RECURSO

Se nada funcionar e você precisar restaurar do zero:

```bash
# 1. Fazer backup dos volumes Docker
ssh root@31.97.83.205
docker run --rm -v flowsint-prod_pg_data_prod:/data -v /root/backups:/backup alpine tar czf /backup/pg_data_backup.tar.gz -C /data .

# 2. Baixar o backup para seu computador
scp root@31.97.83.205:/root/backups/pg_data_backup.tar.gz C:\Users\Platzeck\Desktop\backups\

# 3. Destruir e recriar tudo
cd /root/flowsint
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d

# 4. Restaurar dados (se necessário)
```

---

## 📞 CHECKLIST DE RECUPERAÇÃO

- [ ] VPS responde ao ping
- [ ] SSH conecta
- [ ] Docker daemon rodando
- [ ] Containers todos UP
- [ ] PostgreSQL respondendo
- [ ] Redis respondendo
- [ ] Neo4j respondendo
- [ ] API respondendo (http://localhost:5001/health)
- [ ] Nginx rodando
- [ ] Site carrega (https://rsl.scarletredsolutions.com)
- [ ] SSL válido
- [ ] Login funciona
- [ ] Scarlet-IA funciona

---

## 💡 DICAS IMPORTANTES

1. **Nunca use `docker-compose down -v` em produção** (apaga volumes/dados)
2. **Sempre tenha backups antes de mexer no banco**
3. **Documente todas as mudanças**
4. **Teste em ambiente de dev primeiro**
5. **Monitore recursos (CPU/RAM/Disco) diariamente**

---

## 🔗 ARQUIVOS IMPORTANTES NA VPS

```
/root/flowsint/                          # Código fonte
/root/flowsint/docker-compose.prod.yml   # Configuração dos containers
/var/www/rsl/                            # Frontend
/etc/nginx/sites-available/rsl.conf      # Config Nginx
/var/log/nginx/                          # Logs Nginx
/etc/letsencrypt/                        # Certificados SSL
```

---

## ⚡ COMANDOS ÚTEIS

```bash
# Ver uso de recursos
htop
df -h
free -h
docker stats

# Reiniciar tudo
systemctl restart docker nginx
cd /root/flowsint && docker-compose -f docker-compose.prod.yml restart

# Ver logs
docker logs flowsint-api-prod -f
journalctl -xe -f
tail -f /var/log/nginx/error.log

# Testar conectividade
curl http://localhost:5001/health
curl https://rsl.scarletredsolutions.com/api/health

# Ver processos com mais memória
ps aux --sort=-%mem | head -10

# Ver processos com mais CPU
ps aux --sort=-%cpu | head -10
```

---

**Última atualização:** 22 de Dezembro de 2025
