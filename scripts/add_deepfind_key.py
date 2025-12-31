#!/usr/bin/env python3
"""Script para adicionar DEEPFIND_API_KEY ao vault"""
import os
import sys

# Adicionar o path do flowsint-core
sys.path.insert(0, '/app/flowsint-core/src')

import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from flowsint_core.core.vault import Vault

# Configuração
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://flowsint:flowsint@postgres:5432/flowsint")
DEEPFIND_KEY = "sk-306d377afbe440389bc68afbaff1f7de"

def main():
    engine = create_engine(DATABASE_URL)
    
    with Session(engine) as db:
        # Buscar todos os profiles
        result = db.execute(text("SELECT id, email FROM profiles"))
        profiles = result.fetchall()
        
        print(f"\n🔑 Adicionando DEEPFIND_API_KEY para {len(profiles)} usuários...\n")
        
        success = 0
        errors = 0
        
        for row in profiles:
            profile_id = row[0]
            email = row[1]
            
            try:
                vault = Vault(db, uuid.UUID(str(profile_id)))
                
                # Verificar se já existe
                existing = vault.get_secret("DEEPFIND_API_KEY")
                if existing:
                    print(f"  ✓ {email} - já existe")
                    success += 1
                    continue
                
                # Adicionar
                vault.set_secret("DEEPFIND_API_KEY", DEEPFIND_KEY)
                print(f"  ✓ {email} - adicionada!")
                success += 1
                
            except Exception as e:
                print(f"  ✗ {email} - Erro: {e}")
                errors += 1
        
        print(f"\n✅ Sucesso: {success} | ❌ Erros: {errors}\n")

if __name__ == "__main__":
    main()
