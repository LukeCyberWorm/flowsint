"""
Serviço de chat com IA usando OpenAI
"""
import os
import json
import asyncio
from typing import AsyncGenerator, Dict, Any, List
from openai import AsyncOpenAI
from sse_starlette.sse import ServerSentEvent
from app.models.scarlet_ia import ScarletIAMessage, ScarletIANote, ScarletIAChatSession
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Não inicializa o client aqui - será lazy loaded
_client_instance = None

def _get_client() -> AsyncOpenAI:
    """
    Lazy initialization do client OpenAI
    """
    global _client_instance
    if _client_instance is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY não configurada")
        _client_instance = AsyncOpenAI(api_key=api_key)
    return _client_instance

# Lista de ferramentas OSINT disponíveis
OSINT_TOOLS = [
    {
        "name": "whois_lookup",
        "description": "Consulta informações WHOIS de um domínio",
        "parameters": {"domain": "string"}
    },
    {
        "name": "dns_lookup",
        "description": "Consulta registros DNS (A, AAAA, MX, TXT, etc)",
        "parameters": {"domain": "string", "record_type": "string"}
    },
    {
        "name": "ip_geolocation",
        "description": "Obtém geolocalização de um IP",
        "parameters": {"ip": "string"}
    },
    {
        "name": "subdomain_enum",
        "description": "Enumera subdomínios de um domínio",
        "parameters": {"domain": "string"}
    },
    {
        "name": "port_scan",
        "description": "Escaneia portas abertas em um host",
        "parameters": {"target": "string", "ports": "string"}
    },
    {
        "name": "ssl_check",
        "description": "Verifica certificado SSL/TLS de um domínio",
        "parameters": {"domain": "string"}
    }
]

# Lista de ferramentas Kali Linux disponíveis
KALI_TOOLS = [
    {
        "name": "nmap",
        "description": "Scanner de rede avançado",
        "parameters": {"target": "string", "options": "string"}
    },
    {
        "name": "nikto",
        "description": "Scanner de vulnerabilidades web",
        "parameters": {"target": "string"}
    },
    {
        "name": "sqlmap",
        "description": "Ferramenta de teste de SQL injection",
        "parameters": {"url": "string", "options": "string"}
    },
    {
        "name": "metasploit",
        "description": "Framework de exploração de vulnerabilidades",
        "parameters": {"module": "string", "target": "string"}
    },
    {
        "name": "burpsuite",
        "description": "Proxy para análise de tráfego web",
        "parameters": {"target": "string"}
    },
    {
        "name": "wpscan",
        "description": "Scanner de vulnerabilidades WordPress",
        "parameters": {"url": "string"}
    },
    {
        "name": "gobuster",
        "description": "Brute force de diretórios e arquivos",
        "parameters": {"url": "string", "wordlist": "string"}
    },
    {
        "name": "hydra",
        "description": "Brute force de login",
        "parameters": {"target": "string", "service": "string", "userlist": "string", "passlist": "string"}
    },
    {
        "name": "wireshark",
        "description": "Analisador de pacotes de rede",
        "parameters": {"interface": "string", "filter": "string"}
    },
    {
        "name": "aircrack",
        "description": "Suite de auditoria de redes WiFi",
        "parameters": {"interface": "string", "options": "string"}
    }
]

class ScarletIAService:
    """Serviço de chat com IA"""
    
    def __init__(self):
        self.system_prompt = """Você é Scarlet, uma assistente de segurança cibernética especializada em OSINT e pentesting.

Você tem acesso a ferramentas OSINT e ferramentas do Kali Linux.

Ferramentas OSINT disponíveis:
- whois_lookup: Consulta WHOIS de domínios
- dns_lookup: Consulta DNS (A, AAAA, MX, TXT)
- ip_geolocation: Geolocalização de IPs
- subdomain_enum: Enumeração de subdomínios
- port_scan: Escaneamento de portas
- ssl_check: Verificação de certificados SSL

Ferramentas Kali disponíveis:
- nmap: Scanner de rede
- nikto: Scanner de vulnerabilidades web
- sqlmap: Teste de SQL injection
- metasploit: Framework de exploração
- burpsuite: Proxy de análise web
- wpscan: Scanner WordPress
- gobuster: Brute force de diretórios
- hydra: Brute force de login
- wireshark: Análise de pacotes
- aircrack: Auditoria WiFi

Quando precisar usar uma ferramenta, indique claramente com:
TOOL: nome_da_ferramenta
PARAMS: {parâmetros em JSON}

Seja técnica, precisa e ética em suas análises."""

    async def stream_chat(
        self, 
        message: str,
        chat_id: str,
        db: AsyncSession,
        investigation_id: int = None
    ) -> AsyncGenerator[ServerSentEvent, None]:
        """
        Stream de resposta do chat usando OpenAI com SSE
        """
        client = _get_client()
        
        try:
            # Buscar histórico do chat
            result = await db.execute(
                select(ScarletIAMessage)
                .filter(ScarletIAMessage.chat_id == chat_id)
                .order_by(ScarletIAMessage.created_at)
            )
            history = result.scalars().all()
            
            # Construir mensagens para o OpenAI
            messages = [{"role": "system", "content": self.system_prompt}]
            
            for msg in history[-10:]:  # Últimas 10 mensagens
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
            
            messages.append({"role": "user", "content": message})
            
            # Salvar mensagem do usuário
            user_msg = ScarletIAMessage(
                chat_id=chat_id,
                role="user",
                content=message,
                investigation_id=investigation_id
            )
            db.add(user_msg)
            await db.commit()
            
            # Stream da resposta
            full_response = ""
            
            yield ServerSentEvent(
                data=json.dumps({"type": "step-start", "step": "thinking"}),
                event="step-start"
            )
            
            stream = await client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                stream=True,
                temperature=0.7
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    
                    yield ServerSentEvent(
                        data=json.dumps({"type": "text", "content": content}),
                        event="text"
                    )
            
            # Salvar resposta completa
            assistant_msg = ScarletIAMessage(
                chat_id=chat_id,
                role="assistant",
                content=full_response,
                investigation_id=investigation_id
            )
            db.add(assistant_msg)
            
            # Atualizar sessão
            session_result = await db.execute(
                select(ScarletIAChatSession)
                .filter(ScarletIAChatSession.chat_id == chat_id)
            )
            session = session_result.scalar_one_or_none()
            
            if session:
                session.message_count += 2
            else:
                session = ScarletIAChatSession(
                    chat_id=chat_id,
                    message_count=2,
                    investigation_id=investigation_id
                )
                db.add(session)
            
            await db.commit()
            
            yield ServerSentEvent(
                data=json.dumps({"type": "done"}),
                event="done"
            )
            
        except Exception as e:
            logger.error(f"Erro no stream de chat: {str(e)}", exc_info=True)
            yield ServerSentEvent(
                data=json.dumps({"type": "error", "message": str(e)}),
                event="error"
            )

    async def get_chat_history(
        self, 
        chat_id: str,
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Retorna histórico de mensagens de um chat"""
        result = await db.execute(
            select(ScarletIAMessage)
            .filter(ScarletIAMessage.chat_id == chat_id)
            .order_by(ScarletIAMessage.created_at)
        )
        messages = result.scalars().all()
        
        return [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "parts": msg.parts,
                "sources": msg.sources,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]

    async def create_note(
        self,
        content: str,
        tags: List[str],
        investigation_id: int,
        db: AsyncSession
    ) -> ScarletIANote:
        """Cria uma nova nota"""
        note = ScarletIANote(
            content=content,
            tags=tags,
            investigation_id=investigation_id
        )
        db.add(note)
        await db.commit()
        await db.refresh(note)
        return note

    async def get_notes(
        self,
        investigation_id: int,
        db: AsyncSession
    ) -> List[ScarletIANote]:
        """Retorna todas as notas de uma investigação"""
        result = await db.execute(
            select(ScarletIANote)
            .filter(ScarletIANote.investigation_id == investigation_id)
            .order_by(ScarletIANote.created_at.desc())
        )
        return result.scalars().all()

    async def delete_note(
        self,
        note_id: int,
        db: AsyncSession
    ) -> bool:
        """Deleta uma nota"""
        result = await db.execute(
            select(ScarletIANote)
            .filter(ScarletIANote.id == note_id)
        )
        note = result.scalar_one_or_none()
        
        if note:
            await db.delete(note)
            await db.commit()
            return True
        return False

    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Retorna lista de ferramentas OSINT disponíveis"""
        return OSINT_TOOLS

    def get_kali_tools(self) -> List[Dict[str, Any]]:
        """Retorna lista de ferramentas Kali disponíveis"""
        return KALI_TOOLS

    async def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Executa uma ferramenta OSINT ou Kali
        TODO: Implementar execução real das ferramentas
        """
        # Por enquanto retorna mock
        return {
            "tool": tool_name,
            "parameters": parameters,
            "result": "Execução simulada - implementação pendente",
            "status": "mock"
        }

# Singleton
scarlet_ia_service = ScarletIAService()
