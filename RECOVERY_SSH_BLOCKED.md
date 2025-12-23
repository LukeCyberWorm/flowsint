# 🚨 GUIA DE RECUPERAÇÃO - SSH BLOQUEADO

## ⚠️ Problema
O SSH para o VPS (31.97.83.205) está bloqueado. Possíveis causas:
- ✅ VPS está online (ping responde)
- ❌ Porta SSH 22 está bloqueada
- 🔍 Provável: fail2ban baniu seu IP OU iptables bloqueou conexões

## 🔧 SOLUÇÃO RÁPIDA - Pelo Painel Hostinger

### Passo 1: Acessar Console Web da Hostinger
1. Acesse: https://hpanel.hostinger.com/
2. Login com suas credenciais
3. Vá em **VPS** → Selecione seu VPS
4. Clique em **Console** ou **VNC Console**
5. Isso abrirá um terminal direto no servidor (não usa SSH)

### Passo 2: Login no Console
```bash
# Use o usuário root e senha do VPS
Username: root
Password: [sua senha do VPS]
```

### Passo 3: Verificar e Corrigir

**Opção A - Verificar Fail2ban (mais provável):**
```bash
# Ver se seu IP está banido
fail2ban-client status sshd

# Se seu IP aparecer na lista "Banned IP list", desbanir:
fail2ban-client set sshd unbanip 179.127.67.13

# Ou desabilitar temporariamente fail2ban:
systemctl stop fail2ban

# Depois de conectar via SSH, reative:
systemctl start fail2ban
```

**Opção B - Limpar regras iptables:**
```bash
# CUIDADO: Isso remove TODAS as regras do firewall
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT

# Salvar (só se funcionar)
iptables-save > /etc/iptables/rules.v4
```

**Opção C - Verificar UFW:**
```bash
# Ver status
ufw status

# Se necessário, permitir SSH temporariamente
ufw allow 22/tcp

# Ou desabilitar temporariamente
ufw disable
```

**Opção D - Verificar sshd_config:**
```bash
# Ver se SSH está rodando
systemctl status ssh

# Reiniciar SSH
systemctl restart ssh

# Ver se porta 22 está ouvindo
netstat -tlnp | grep :22
```

### Passo 4: Testar do Windows
Após executar algum comando acima, teste do Windows:
```powershell
ssh root@31.97.83.205 "echo 'SSH OK'"
```

## 🎯 SOLUÇÃO DEFINITIVA

Depois que SSH voltar, execute isto NO SERVIDOR (via console):

```bash
# 1. Resetar fail2ban para configurações mais permissivas
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 10
findtime = 600
bantime = 3600
EOF

systemctl restart fail2ban

# 2. Garantir que UFW permite SSH
ufw allow 22/tcp
ufw --force enable

# 3. Adicionar seu IP à whitelist do fail2ban
echo "[sshd]
enabled = true
ignoreip = 127.0.0.1/8 ::1 179.127.67.13
" > /etc/fail2ban/jail.d/whitelist.conf

systemctl restart fail2ban

# 4. Verificar tudo
echo "=== STATUS ==="
systemctl status ssh | head -5
ufw status
fail2ban-client status sshd
netstat -tlnp | grep :22
```

## 📋 Checklist de Verificação

Execute após recuperar acesso:
```bash
# ✅ SSH funcionando?
ssh root@31.97.83.205 "uptime"

# ✅ Containers rodando?
ssh root@31.97.83.205 "docker ps --format 'table {{.Names}}\t{{.Status}}'"

# ✅ Nginx funcionando?
ssh root@31.97.83.205 "systemctl status nginx | head -5"

# ✅ Site acessível?
curl -I https://rsl.scarletredsolutions.com
```

## 🚀 Próximos Passos

Depois de recuperar o acesso:
1. ✅ Adicione seu IP à whitelist permanente
2. ✅ Configure fail2ban com limites mais altos (10 tentativas)
3. ✅ Teste regras de firewall antes de salvar
4. ✅ Mantenha acesso ao console web sempre disponível

## ⚡ Comandos de Emergência

```bash
# Parar TUDO que pode estar bloqueando
systemctl stop fail2ban
systemctl stop ufw
iptables -F
systemctl restart ssh

# Depois de conectar, reative gradualmente:
systemctl start ufw
systemctl start fail2ban
```

## 📞 Suporte Hostinger
Se nada funcionar, contate o suporte da Hostinger:
- Chat ao vivo no hpanel
- Eles podem acessar o servidor e liberar SSH para você
