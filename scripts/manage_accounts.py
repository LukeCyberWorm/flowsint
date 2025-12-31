#!/usr/bin/env python3
"""
Script para desativar contas não autorizadas
Mantém apenas as contas na lista permitida
"""
import os
import sys
sys.path.insert(0, '/app/flowsint-core/src')

from datetime import datetime, UTC
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# Configuração
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://flowsint:flowsint@postgres:5432/flowsint")

# Contas permitidas
ALLOWED_EMAILS = [
    "lucasaugustodeoliveira@gmail.com",
    "douglasmunizdutra@gmail.com",
    "rafaelmcpsouza@hotmail.com",
    "lucas.oliveira@scarletredsolutions.com",
    "felipeducattiadv@gmail.com"
]

# Contas ADMIN permanentes (sem trial)
PERMANENT_ADMIN = [
    "lucasaugustodeoliveira@gmail.com",
    "douglasmunizdutra@gmail.com",
    "rafaelmcpsouza@hotmail.com",
    "lucas.oliveira@scarletredsolutions.com"
]

def manage_accounts():
    engine = create_engine(DATABASE_URL)
    
    with Session(engine) as db:
        print(f"\n🔐 Gerenciando Contas do Sistema\n")
        
        # Buscar todas as contas
        result = db.execute(text("SELECT id, email, is_active FROM profiles"))
        all_profiles = result.fetchall()
        
        print(f"Total de contas no sistema: {len(all_profiles)}\n")
        
        kept = 0
        deactivated = 0
        
        for profile in all_profiles:
            profile_id, email, is_active = profile
            
            if email.lower() in [e.lower() for e in ALLOWED_EMAILS]:
                # Manter ativa
                if not is_active:
                    db.execute(text(f"""
                        UPDATE profiles 
                        SET is_active = true 
                        WHERE id = '{profile_id}'
                    """))
                    print(f"✅ {email} - reativada")
                else:
                    print(f"✅ {email} - mantida ativa")
                
                # Se for conta permanente, remover trial
                if email.lower() in [e.lower() for e in PERMANENT_ADMIN]:
                    db.execute(text(f"""
                        UPDATE profiles 
                        SET trial_ends_at = NULL,
                            is_paid = true
                        WHERE id = '{profile_id}'
                    """))
                    print(f"   👑 {email} - configurada como ADMIN permanente")
                
                kept += 1
            else:
                # Desativar
                if is_active:
                    db.execute(text(f"""
                        UPDATE profiles 
                        SET is_active = false 
                        WHERE id = '{profile_id}'
                    """))
                    print(f"❌ {email} - desativada")
                    deactivated += 1
                else:
                    print(f"⏭️  {email} - já estava inativa")
        
        db.commit()
        
        print(f"\n{'='*60}")
        print(f"✅ Contas mantidas ativas: {kept}")
        print(f"❌ Contas desativadas: {deactivated}")
        print(f"{'='*60}\n")
        
        # Mostrar lista final de contas ativas
        print(f"📋 Contas ativas no sistema:\n")
        result = db.execute(text("SELECT email, trial_ends_at FROM profiles WHERE is_active = true ORDER BY email"))
        active = result.fetchall()
        
        for email, trial_end in active:
            if trial_end:
                print(f"  • {email} (trial até {trial_end.strftime('%d/%m/%Y')})")
            else:
                print(f"  • {email}")
        print()

if __name__ == "__main__":
    manage_accounts()
