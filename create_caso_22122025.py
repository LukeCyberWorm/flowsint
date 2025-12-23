import sys
import uuid
import secrets
from pathlib import Path

# Adicionar flowsint-api ao path
api_path = Path(__file__).parent / "flowsint-api"
sys.path.insert(0, str(api_path))

from flowsint_core.core.postgre_db import SessionLocal
from app.models.dossier import Dossier, DossierStatus

def create_caso_22122025():
    db = SessionLocal()
    try:
        # Gerar token único e seguro
        token = f"SRS-CASO22122025-{secrets.token_urlsafe(12)}"
        
        # Verificar se já existe
        existing = db.query(Dossier).filter(Dossier.case_number == "INV-2025-1222-001").first()
        if existing:
            print(f"⚠️  Dossiê já existe: {existing.id}")
            print(f"📋 Token existente: {existing.access_token}")
            print(f"🔗 Acesso: https://dossie.scarletredsolutions.com/view/{existing.access_token}")
            return existing.access_token

        # Criar dossiê
        dossier = Dossier(
            id=uuid.uuid4(),
            case_number="INV-2025-1222-001",
            title="Investigação Veicular - Yamaha Fazer YS250 (DXM2C19)",
            description="""# Relatório Forense - Caso INV-2025-1222-001

## 🏍️ Veículo Investigado
**Motocicleta Yamaha Fazer YS250 (2008, Preta)**
- **Placa**: DXM2C19
- **Chassi**: 9C6KG017080073424
- **Renavam**: 00956985220
- **Situação**: Em circulação (sem restrições)
- **Licenciamento 2025**: ✅ Pago

---

## 👤 Proprietário Registrado

### Tiago Ferreira Paulo
- **CPF**: 319.822.008-47
- **Nascimento**: 31/03/1983 (42 anos)
- **Mãe**: Zulmira Ferreira Paulo

#### 📍 Endereço Principal
**Rua Clorino de Oliveira Cajé, 229 - Jardim Nelly, São Paulo-SP**
- CEP: 05371-140
- Região: Zona Oeste (Butantã/Rio Pequeno)

#### 💰 Perfil Econômico
- **Renda Estimada**: R$ 372,94/mês
- **Poder Aquisitivo**: Muito Baixo (R$ 112 a R$ 630)
- **Score CSB**: 404 (Médio)
- **Score CSBA**: 133 (Altíssimo risco)
- **Perfil**: No Coração da Periferia / Jovens da Periferia

#### 👨‍👩‍👦 Parentes
- Zulmira Ferreira Paulo (Mãe)
- Felipe Ferreira Paulo (Irmão)

#### 🔍 Observações
Baixo perfil econômico; improvável manutenção de moto 250cc sem renda formal. Possível uso para trabalho informal (motoboy).

---

## 👤 Indivíduo Associado

### Joelma Ribeiro de Morais Pinto
- **CPF**: 283.890.568-60
- **Nascimento**: 05/02/1981 (44 anos)
- **Mãe**: Josefa Vital de Morais

#### 💼 Profissão
- Operadora de Caixa / Recepcionista
- Renda Histórica: ~R$ 2.400 (2013)

#### 💰 Perfil Econômico
- **Score CSB**: 318 (Médio)
- **Score CSBA**: 338 (Alto risco)
- **Perfil**: Esticando a Renda / Adultos Urbanos Estabelecidos

#### 🚗 Veículo Associado
- **Placa**: AAD2459
- **Modelo**: Fiat Premio S (1990)

#### 📍 Endereços
1. **Rua Borges de Medeiros, 252** - Vila Fátima, São Paulo-SP (CEP: 03920-010)
2. **Rua Manoel Viana** (próximo) - Vila Ema / São Lucas, São Paulo-SP
3. **Rua Isaias, 220** - Jardim Maria Luiza / Jardim Martini, São Paulo-SP (CEP: 04434-030)
4. **Alameda Itu, 852** - Jardim Paulista, São Paulo-SP

#### 🔍 Observações
Forte concentração na Zona Sul/Leste de SP. Associação possível via transferência não comunicada ou uso informal.

---

## 🗺️ Análise de Rotas

### Localizações
- **Proprietário (Tiago)**: Zona Oeste - Jardim Nelly (Butantã/Rio Pequeno)
- **Associada (Joelma)**: Zona Sul/Leste - Vila Fátima, Vila Ema + possível trabalho no Centro (Jardim Paulista)

### Distâncias
- Jardim Nelly ↔ Vila Fátima: **25-30 km**
- Vila Fátima ↔ Jardim Paulista: **15 km**

---

## 🎯 Conclusões

### Hipótese Principal
Veículo registrado em nome de Tiago desde pelo menos 2025, mas possível associação anterior com Joelma. Descompasso socioeconômico sugere transferência recente ou uso compartilhado.

### ⚠️ Riscos
- ✅ Nenhum registro criminal
- ✅ Sem restrições veiculares
- ⚠️ Alto risco creditício em ambos

### 📋 Recomendações
1. Vigilância física nos endereços principais
2. Verificação de data exata de transferência
3. Cruzamento com câmeras de trânsito ou apps de entrega
4. Entrevista com vizinhos ou parentes (ex.: Marcos Roberto Pinto ou Zulmira)

---

**🔒 Relatório gerado por:** Scarlet Red Solutions  
**📅 Data da Consulta:** 22/12/2025  
**🆔 Caso ID:** INV-2025-1222-001
""",
            status=DossierStatus.ACTIVE.value,
            client_name="Cliente - Investigação Veicular",
            is_public=True,
            access_token=token,
            created_by=None  # System created
        )
        db.add(dossier)
        db.commit()
        
        print("✅ Dossiê criado com sucesso!")
        print("─" * 60)
        print(f"📋 ID do Dossiê: {dossier.id}")
        print(f"🔢 Número do Caso: {dossier.case_number}")
        print(f"📝 Título: {dossier.title}")
        print(f"🔑 Token de Acesso: {token}")
        print("─" * 60)
        print(f"🔗 Link para o cliente:")
        print(f"   https://dossie.scarletredsolutions.com/view/{token}")
        print("─" * 60)
        
        return token
        
    except Exception as e:
        print(f"❌ Erro ao criar dossiê: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    token = create_caso_22122025()
    if token:
        print("\n✨ Pronto! Envie o link acima para o cliente.")
