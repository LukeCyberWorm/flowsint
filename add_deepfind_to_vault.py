"""
Script para adicionar DEEPFIND_API_KEY ao vault do FlowsInt
"""
import uuid
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# Configuração do banco
DATABASE_URL = "postgresql://flowsint:flowsint@localhost:5432/flowsint"

# Chave da API
DEEPFIND_API_KEY = "sk-306d377afbe440389bc68afbaff1f7de"

def add_deepfind_key():
    """Adiciona a chave DEEPFIND_API_KEY ao vault de todos os usuários"""
    
    engine = create_engine(DATABASE_URL)
    
    with Session(engine) as db:
        # Importar as classes necessárias
        sys.path.insert(0, '/app/flowsint-core/src')
        from flowsint_core.core.vault import Vault
        
        # Buscar todos os profiles
        result = db.execute("SELECT id, email FROM profiles")
        profiles = result.fetchall()
        
        print(f"Encontrados {len(profiles)} profiles")
        
        for profile_id, email in profiles:
            try:
                # Criar instância do vault para este usuário
                vault = Vault(db, uuid.UUID(profile_id))
                
                # Verificar se já existe
                existing = vault.get_secret("DEEPFIND_API_KEY")
                if existing:
                    print(f"✓ {email} - já possui DEEPFIND_API_KEY")
                    continue
                
                # Adicionar a chave
                vault.set_secret("DEEPFIND_API_KEY", DEEPFIND_API_KEY)
                print(f"✓ {email} - DEEPFIND_API_KEY adicionada")
                
            except Exception as e:
                print(f"✗ {email} - Erro: {e}")
        
        print("\nConcluído!")

if __name__ == "__main__":
    add_deepfind_key()
