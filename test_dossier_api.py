"""
Script de teste para API de Dossiês
"""
import requests
import json

API_URL = "http://localhost:8000"

def test_health():
    """Testa se a API está respondendo"""
    print("\n🔍 Testando Health Check...")
    response = requests.get(f"{API_URL}/health")
    print(f"✅ Status: {response.status_code}")
    print(f"   Resposta: {response.json()}")
    return response.status_code == 200

def test_login():
    """Testa login e retorna token"""
    print("\n🔍 Testando Login...")
    data = {
        "username": "lucas.oliveira@scarletredsolutions.com",  # Ajuste conforme necessário
        "password": "sua_senha"  # Ajuste conforme necessário
    }
    response = requests.post(f"{API_URL}/api/auth/token", data=data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"✅ Login bem-sucedido!")
        print(f"   Token: {token[:50]}...")
        return token
    else:
        print(f"❌ Erro no login: {response.status_code}")
        print(f"   Mensagem: {response.text}")
        return None

def test_list_dossiers(token):
    """Testa listagem de dossiês"""
    print("\n🔍 Testando Listagem de Dossiês...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/api/dossiers/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Dossiês listados com sucesso!")
        print(f"   Total: {data['total']}")
        print(f"   Itens retornados: {len(data['items'])}")
        return True
    else:
        print(f"❌ Erro ao listar: {response.status_code}")
        print(f"   Mensagem: {response.text}")
        return False

def test_create_dossier(token):
    """Testa criação de dossiê"""
    print("\n🔍 Testando Criação de Dossiê...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Gera dados de teste
    import uuid
    data = {
        "investigation_id": str(uuid.uuid4()),  # Ajuste com ID real se necessário
        "case_number": f"TEST-{uuid.uuid4().hex[:8]}",
        "title": "Dossiê de Teste",
        "description": "Este é um dossiê de teste criado automaticamente",
        "client_name": "Cliente Teste",
        "client_email": "cliente@teste.com",
        "is_public": True
    }
    
    response = requests.post(f"{API_URL}/api/dossiers/", headers=headers, json=data)
    if response.status_code == 201:
        dossier = response.json()
        print(f"✅ Dossiê criado com sucesso!")
        print(f"   ID: {dossier['id']}")
        print(f"   Caso: {dossier['case_number']}")
        print(f"   Token de Acesso: {dossier.get('access_token', 'N/A')}")
        return dossier
    else:
        print(f"❌ Erro ao criar: {response.status_code}")
        print(f"   Mensagem: {response.text}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("  🧪 TESTE DA API DE DOSSIÊS")
    print("  Scarlet Red Solutions")
    print("=" * 60)
    
    # 1. Health Check
    if not test_health():
        print("\n❌ API não está respondendo. Certifique-se de que está rodando:")
        print("   cd flowsint-api")
        print("   uvicorn app.main:app --reload")
        exit(1)
    
    # 2. Login
    print("\n⚠️  Para testar login, edite o arquivo e adicione suas credenciais.")
    print("   Comentando testes que requerem autenticação...")
    
    # Descomente as linhas abaixo após adicionar credenciais válidas
    # token = test_login()
    # if token:
    #     test_list_dossiers(token)
    #     test_create_dossier(token)
    
    print("\n" + "=" * 60)
    print("✅ Testes básicos concluídos!")
    print("=" * 60)
