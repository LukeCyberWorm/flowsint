# Instruções de Deploy Manual (RSL Search)

Como o terminal automático está conflitando com a entrada de senha, por favor execute estes comandos manualmente no seu terminal (PowerShell ou Bash).

## 1. Preparar a pasta no servidor
Garanta que a pasta existe no servidor VPS.

```powershell
ssh root@31.97.83.205 "mkdir -p /var/www/rsl"
```

## 2. Enviar os arquivos (Upload)
Este comando vai pedir a senha do servidor. Digite a senha quando solicitado.

```powershell
scp -r flowsint-app/dist/* root@31.97.83.205:/var/www/rsl/
```

## 3. Ajustar Permissões e Reiniciar Nginx
Após o upload, rode este comando para garantir que o Nginx consiga ler os arquivos e atualizar o cache.

```powershell
ssh root@31.97.83.205 "chown -R www-data:www-data /var/www/rsl && systemctl restart nginx"
```

---
**Status:**
- Build local: ✅ Sucesso (`flowsint-app/dist` atualizado)
- Roteamento: ✅ Corrigido (`routeTree.gen.ts` regenerado)
- Próximo passo: Apenas rodar os comandos acima.
