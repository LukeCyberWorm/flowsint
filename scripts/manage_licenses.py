#!/usr/bin/env python3
"""
Script de gerenciamento de licenças RSL-Scarlet
Uso: python manage_licenses.py <comando> <email> [dias]
"""

import sys
import subprocess
from datetime import datetime, timedelta

CONTAINER = "flowsint-postgres-prod"
DB_USER = "flowsint"
DB_NAME = "flowsint"

def run_sql(query):
    """Executa uma query SQL no container PostgreSQL"""
    cmd = [
        "docker", "exec", CONTAINER,
        "psql", "-U", DB_USER, "-d", DB_NAME,
        "-c", query
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"Erro: {result.stderr}", file=sys.stderr)
    return result.returncode == 0

def grant_paid_access(email):
    """Concede acesso pago permanente a um usuário"""
    query = f"UPDATE profiles SET is_paid = true, trial_ends_at = NULL WHERE email = '{email}';"
    print(f"Concedendo acesso pago para {email}...")
    if run_sql(query):
        print(f"✓ Usuário {email} agora tem acesso pago permanente!")
        list_user(email)

def revoke_paid_access(email, trial_days=5):
    """Remove acesso pago e define novo período de trial"""
    query = f"UPDATE profiles SET is_paid = false, trial_ends_at = NOW() + INTERVAL '{trial_days} days' WHERE email = '{email}';"
    print(f"Revogando acesso pago de {email} e definindo trial de {trial_days} dias...")
    if run_sql(query):
        print(f"✓ Acesso pago revogado. Usuário {email} agora tem {trial_days} dias de trial.")
        list_user(email)

def extend_trial(email, days):
    """Estende o período de trial de um usuário"""
    query = f"UPDATE profiles SET trial_ends_at = NOW() + INTERVAL '{days} days' WHERE email = '{email}';"
    print(f"Estendendo trial de {email} para +{days} dias...")
    if run_sql(query):
        print(f"✓ Trial estendido com sucesso!")
        list_user(email)

def list_user(email):
    """Lista informações de um usuário específico"""
    query = f"SELECT email, is_paid, created_at, trial_ends_at, CASE WHEN trial_ends_at < NOW() THEN 'EXPIRADO' WHEN trial_ends_at > NOW() THEN 'ATIVO' ELSE 'N/A' END as status FROM profiles WHERE email = '{email}';"
    run_sql(query)

def list_all_users():
    """Lista todos os usuários"""
    query = "SELECT email, is_paid, trial_ends_at, CASE WHEN is_paid THEN '✓ PAGO' WHEN trial_ends_at < NOW() THEN '✗ EXPIRADO' ELSE '⏳ TRIAL' END as status FROM profiles ORDER BY created_at DESC;"
    print("Lista de usuários:")
    run_sql(query)

def list_expired():
    """Lista usuários com trial expirado"""
    query = "SELECT email, trial_ends_at, EXTRACT(DAY FROM NOW() - trial_ends_at) as dias_expirado FROM profiles WHERE is_paid = false AND trial_ends_at < NOW() ORDER BY trial_ends_at DESC;"
    print("Usuários com trial expirado:")
    run_sql(query)

def show_help():
    """Exibe ajuda do script"""
    print("""
Gerenciamento de Licenças RSL-Scarlet
======================================

Uso: python manage_licenses.py <comando> [argumentos]

Comandos:
  grant <email>           - Concede acesso pago permanente
  revoke <email> [dias]   - Revoga acesso pago e define trial (padrão: 5 dias)
  extend <email> <dias>   - Estende período de trial
  list                    - Lista todos os usuários
  list <email>            - Lista informações de um usuário específico
  expired                 - Lista usuários com trial expirado
  help                    - Exibe esta ajuda

Exemplos:
  python manage_licenses.py grant cliente@empresa.com
  python manage_licenses.py revoke cliente@empresa.com 10
  python manage_licenses.py extend teste@teste.com 30
  python manage_licenses.py list
  python manage_licenses.py list cliente@empresa.com
  python manage_licenses.py expired
""")

def main():
    if len(sys.argv) < 2:
        show_help()
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "help":
        show_help()
    elif command == "list":
        if len(sys.argv) > 2:
            list_user(sys.argv[2])
        else:
            list_all_users()
    elif command == "expired":
        list_expired()
    elif command == "grant":
        if len(sys.argv) < 3:
            print("Erro: Email não fornecido")
            sys.exit(1)
        grant_paid_access(sys.argv[2])
    elif command == "revoke":
        if len(sys.argv) < 3:
            print("Erro: Email não fornecido")
            sys.exit(1)
        days = int(sys.argv[3]) if len(sys.argv) > 3 else 5
        revoke_paid_access(sys.argv[2], days)
    elif command == "extend":
        if len(sys.argv) < 4:
            print("Erro: Email e/ou dias não fornecidos")
            print("Uso: python manage_licenses.py extend <email> <dias>")
            sys.exit(1)
        extend_trial(sys.argv[2], int(sys.argv[3]))
    else:
        print(f"Comando desconhecido: {command}")
        show_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
