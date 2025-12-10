from flowsint_core.core.vault import Vault
from flowsint_core.core.database import SessionLocal
import uuid

# Cria sessão do banco e vault
db = SessionLocal()
owner_id = uuid.UUID('00000000-0000-0000-0000-000000000001')  # Owner padrão

vault = Vault(db, owner_id)
vault.set_secret('PORTAL_TRANSPARENCIA_API_KEY', '115acf783eb0a182c84e08a96f4b36fb')
print('✓ Chave PORTAL_TRANSPARENCIA_API_KEY adicionada ao Vault!')

# Verifica se foi salva
key = vault.get_secret('PORTAL_TRANSPARENCIA_API_KEY')
if key:
    print(f'✓ Verificação OK: {key[:10]}...')
else:
    print('✗ Erro ao verificar chave')

db.close()
