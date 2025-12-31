#!/usr/bin/env python3
"""
Script para criar conta beta com acesso de 30 dias
e copiar todas as API keys da conta principal
"""
import os
import sys
sys.path.insert(0, '/app/flowsint-core/src')

import uuid
from datetime import datetime, timedelta, UTC
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from flowsint_core.core.vault import Vault
import bcrypt

# Configuração
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://flowsint:flowsint@postgres:5432/flowsint")

# Dados da nova conta
NEW_EMAIL = "felipeducattiadv@gmail.com"
NEW_PASSWORD = "AcessoBETA$RSL-SCARLET-03"
TRIAL_DAYS = 30

# Conta de origem para copiar APIs
SOURCE_EMAIL = "lucas.oliveira@scarletredsolutions.com"

def create_beta_account():
    engine = create_engine(DATABASE_URL)
    
    with Session(engine) as db:
        print(f"\n🔐 Criando conta beta: {NEW_EMAIL}\n")
        
        # 1. Verificar se conta já existe
        result = db.execute(text(f"SELECT id FROM profiles WHERE email = '{NEW_EMAIL}'"))
        existing = result.fetchone()
        
        if existing:
            print(f"⚠️  Conta {NEW_EMAIL} já existe! Atualizando...")
            profile_id = existing[0]
            
            # Atualizar senha e trial
            hashed = bcrypt.hashpw(NEW_PASSWORD.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            trial_end = datetime.now(UTC) + timedelta(days=TRIAL_DAYS)
            
            db.execute(text(f"""
                UPDATE profiles 
                SET hashed_password = '{hashed}',
                    trial_ends_at = '{trial_end.isoformat()}',
                    is_paid = false,
                    is_active = true
                WHERE email = '{NEW_EMAIL}'
            """))
            db.commit()
        else:
            # Criar nova conta
            profile_id = str(uuid.uuid4())
            hashed = bcrypt.hashpw(NEW_PASSWORD.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            trial_end = datetime.now(UTC) + timedelta(days=TRIAL_DAYS)
            
            db.execute(text(f"""
                INSERT INTO profiles (id, email, hashed_password, first_name, last_name, is_active, trial_ends_at, is_paid, created_at)
                VALUES (
                    '{profile_id}',
                    '{NEW_EMAIL}',
                    '{hashed}',
                    'Felipe',
                    'Ducatti',
                    true,
                    '{trial_end.isoformat()}',
                    false,
                    '{datetime.now(UTC).isoformat()}'
                )
            """))
            db.commit()
            print(f"✅ Conta criada com ID: {profile_id}")
        
        # 2. Buscar conta de origem
        result = db.execute(text(f"SELECT id FROM profiles WHERE email = '{SOURCE_EMAIL}'"))
        source = result.fetchone()
        
        if not source:
            print(f"❌ Conta de origem {SOURCE_EMAIL} não encontrada!")
            return
        
        source_id = source[0]
        print(f"✅ Conta de origem encontrada: {source_id}")
        
        # 3. Copiar todas as API keys
        print(f"\n📋 Copiando API keys de {SOURCE_EMAIL} para {NEW_EMAIL}...")
        
        source_vault = Vault(db, source_id if isinstance(source_id, uuid.UUID) else uuid.UUID(source_id))
        dest_vault = Vault(db, profile_id if isinstance(profile_id, uuid.UUID) else uuid.UUID(profile_id))
        
        # Buscar todas as keys da conta de origem
        result = db.execute(text(f"SELECT name FROM keys WHERE owner_id = '{source_id}'"))
        keys = result.fetchall()
        
        copied = 0
        for key_row in keys:
            key_name = key_row[0]
            try:
                # Obter valor da key
                key_value = source_vault.get_secret(key_name)
                if key_value:
                    # Verificar se já existe no destino
                    existing_key = dest_vault.get_secret(key_name)
                    if existing_key:
                        print(f"  ⏭️  {key_name} - já existe")
                    else:
                        # Copiar para nova conta
                        dest_vault.set_secret(key_name, key_value)
                        print(f"  ✅ {key_name} - copiada")
                        copied += 1
            except Exception as e:
                print(f"  ❌ {key_name} - erro: {e}")
        
        print(f"\n✅ Total de keys copiadas: {copied}")
        
        # 4. Informações finais
        print(f"\n{'='*60}")
        print(f"✅ CONTA BETA CRIADA COM SUCESSO!")
        print(f"{'='*60}")
        print(f"📧 Email: {NEW_EMAIL}")
        print(f"🔑 Senha: {NEW_PASSWORD}")
        print(f"⏰ Acesso até: {trial_end.strftime('%d/%m/%Y')}")
        print(f"🔐 API Keys copiadas: {copied}")
        print(f"{'='*60}\n")

if __name__ == "__main__":
    create_beta_account()
