# 🚀 Deploy do Frontend FlowsInt

## ⚠️ IMPORTANTE: Diretório Correto

O nginx está configurado para servir de `/var/www/rsl/`, **NÃO** de `/var/www/html/`!

## 🛠️ Como fazer deploy

### Método 1: Script Automatizado (Recomendado)

```powershell
.\deploy-frontend.ps1
```

### Método 2: Manual

```powershell
# 1. Build
cd flowsint-app
npm run build

# 2. Deploy
ssh root@31.97.83.205 "rm -rf /var/www/rsl/* && mkdir -p /var/www/rsl"
scp -r dist/* root@31.97.83.205:/var/www/rsl/
ssh root@31.97.83.205 "chown -R www-data:www-data /var/www/rsl && systemctl restart nginx"
```

## 🌐 Após o Deploy

1. Acesse: https://rsl.scarletredsolutions.com
2. **Limpe o cache do navegador**: `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
3. Abra o DevTools (F12) e verifique se o novo bundle foi carregado

## 📁 Estrutura de Diretórios

```
/var/www/
├── rsl/              ← Frontend principal (usado pelo nginx)
├── html/             ← NÃO usar! Diretório padrão do Apache
├── rsl-control/      ← Painel de controle
└── scarletredsolutions/ ← Site institucional
```

## 🔍 Verificar Deploy

```bash
# Ver qual arquivo está sendo servido
ssh root@31.97.83.205 "ls -lh /var/www/rsl/assets/index-*.js"

# Ver o index.html
ssh root@31.97.83.205 "cat /var/www/rsl/index.html | grep 'index-'"

# Ver configuração do nginx
ssh root@31.97.83.205 "grep 'root' /etc/nginx/sites-available/rsl.conf"
```

## 🐛 Troubleshooting

### Navegador carrega arquivo antigo
- Limpe o cache: `Ctrl+Shift+R`
- Ou use modo anônimo: `Ctrl+Shift+N`
- Verifique no DevTools (Network) qual arquivo está sendo carregado

### Erro 404 nos assets
- Verifique se os arquivos estão em `/var/www/rsl/`
- Confira as permissões: `ls -la /var/www/rsl/`

### Mudanças não aparecem
- Confirme que fez o build: `npm run build`
- Verifique se enviou para o diretório correto (`/var/www/rsl/`)
- Reinicie o nginx: `systemctl restart nginx`
