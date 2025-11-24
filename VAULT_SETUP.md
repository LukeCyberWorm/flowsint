# 🔐 Configuração do Vault - API Keys Necessárias

## ⚠️ Transforms que precisam de API Keys:

### 1. **ip_to_asn** (ASN Lookup)
- **Key necessária**: `PDCP_API_KEY`
- **Onde obter**: [https://pdcp.io](https://pdcp.io) ou serviço similar
- **Como configurar**:
  1. Acesse: https://rsl.scarletredsolutions.com/dashboard/settings/vault
  2. Clique em "Add Secret"
  3. Nome: `PDCP_API_KEY`
  4. Valor: Sua API key do PDCP

### 2. **ip_to_infos** (Geolocalização de IP)
- **Possíveis APIs**:
  - IPInfo.io: `IPINFO_API_KEY`
  - IP-API.com (gratuita, sem key)
  - MaxMind GeoIP2
- **Status**: Verificar qual API o transform está usando

### 3. **domain_to_whois** 
- **Status**: ✅ Funcionando (não precisa de API key)

### 4. **domain_to_subdomains**
- **Ferramentas**:
  - Subfinder: ✅ Instalado
  - Fallback para crt.sh: ✅ Funcionando
- **Status**: ✅ Funcionando

### 5. **ip_to_ports** (Port Scanning)
- **Ferramenta**: Naabu
- **Status**: ✅ Instalado
- **Nota**: Pode precisar de permissões especiais para raw sockets

## 📝 Como adicionar secrets no Vault:

1. Acesse o sistema: https://rsl.scarletredsolutions.com
2. Vá para: **Settings → Vault**
3. Clique em **"Add Secret"**
4. Preencha:
   - **Name**: Nome exato da chave (ex: `PDCP_API_KEY`)
   - **Value**: Valor da API key
5. Clique em **"Save"**

## 🔍 Verificar se transforms estão funcionando:

Execute um transform e verifique os logs:
- ✅ **CMPL** = Transform completou com sucesso
- ❌ **FAIL** = Transform falhou (ver mensagem de erro)
- 📊 **GRPH** = Dados foram adicionados ao grafo

## 🐛 Troubleshooting:

### Transform retorna vazio (`{'result': []}`):
1. Verificar se a API key está configurada no Vault
2. Verificar se a ferramenta Docker está instalada
3. Verificar logs do Celery: `docker logs flowsint-celery-prod --tail 50`

### Transform falha com erro de API key:
```
FAIL Transform X errored: Required vault secret 'Y' is missing
```
→ Adicione a secret 'Y' no Vault

### Transform falha com erro de Docker:
```
FAIL X exception: Failed to connect to Docker daemon
```
→ Container Celery precisa de acesso ao Docker socket (✅ já configurado)

## 📦 Imagens Docker instaladas:

- ✅ `projectdiscovery/subfinder:latest`
- ✅ `projectdiscovery/naabu:latest`

## 🎯 Próximos passos:

1. [ ] Obter API key do PDCP ou similar para ASN lookups
2. [ ] Configurar API key no Vault
3. [ ] Testar transforms de IP novamente
4. [ ] Verificar se `ip_to_infos` precisa de API key específica
