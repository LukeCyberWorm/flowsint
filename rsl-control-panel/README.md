# Painel ADM (controle.denunciagolpe.com.br)

Estrutura inicial do painel administrativo seguro para gestão de denúncias, usuários, comentários, auditoria e métricas.

## Componentes
- index.html: login + bootstrap app
- dashboard.html: SPA principal
- assets/: css/js/images
- api/: endpoints de autenticação e dados restritos (ADMIN)
- logs/: arquivos de auditoria (rotacionar futuramente)

## Roadmap (fase 1)
1. Autenticação forte (email + senha + 2FA opcional placeholder)
2. Sessões com tokens httpOnly + CSRF token separado
3. Listagem denúncias (filtros, aprovação, detalhe completo)
4. Comentários (moderar/apagar)
5. Usuários (visualizar, bloquear, ver IPs e histórico login)
6. Logs de acesso e ações
7. Métricas rápidas (cards topo)

## Segurança
- SameSite=Strict cookies
- Regeneração de session id pós-login
- Rate limit login
- Hash de senhas BCRYPT
- Sanitização universal de saída no front

## Próximos Passos
Implementar endpoints restantes, pagination, export CSV, busca avançada, relatórios agregados.
