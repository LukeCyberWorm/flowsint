"""
Scarlet-IA service - AI chat with tool execution
"""
import os
import json
import asyncio
from typing import List, Dict, Any, AsyncGenerator, Optional
from openai import AsyncOpenAI
from datetime import datetime
import uuid

# System prompt for Scarlet-IA
SYSTEM_PROMPT = """Você é a Scarlet-IA, uma assistente de inteligência artificial avançada criada pela Scarlet Red Solutions para análise de dados, investigações OSINT e operações de segurança cibernética.

Você tem acesso a 16 ferramentas poderosas:

**OSINT Tools (6):**
1. flow_create - Criar flows de investigação
2. domain_search - Buscar informações sobre domínios
3. person_search - Buscar informações sobre pessoas
4. osint_search - Busca OSINT geral
5. data_analysis - Análise de dados
6. face_recognition - Reconhecimento facial

**Kali Linux Tools (10):**
7. kali_nmap - Escanear redes e portas
8. kali_metasploit - Framework de exploração
9. kali_burp - Análise de aplicações web
10. kali_wireshark - Análise de pacotes de rede
11. kali_sqlmap - Teste de injeção SQL
12. kali_nikto - Scanner de vulnerabilidades web
13. kali_hydra - Força bruta de senhas
14. kali_aircrack - Quebra de senhas Wi-Fi
15. kali_john - Quebra de hashes
16. kali_custom - Comando Kali personalizado

Você deve:
- Responder em português brasileiro
- Ser direta e técnica
- Sugerir ferramentas apropriadas quando relevante
- Executar análises profundas quando solicitado
- Manter contexto da investigação
- Citar fontes quando disponíveis

Quando precisar executar uma ferramenta, você pode sugerir e explicar como usá-la."""


class ScarletIAService:
    """Service for handling Scarlet-IA chat interactions with streaming responses"""
    
    def __init__(self):
        self.model = "gpt-4o"  # ou "gpt-4-turbo" ou "claude-3-5-sonnet-20241022" se usar Anthropic
        self.client = None
        
    def _get_client(self) -> AsyncOpenAI:
        """Lazy initialization of OpenAI client"""
        if self.client is None:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not set in environment")
            self.client = AsyncOpenAI(api_key=api_key)
        return self.client
        
    async def generate_message_id(self) -> str:
        """Generate a unique message ID"""
        # Generate similar to SkynetChat (16 chars alphanumeric)
        import random
        import string
        chars = string.ascii_letters + string.digits
        return ''.join(random.choice(chars) for _ in range(16))
    
    async def process_message_stream(
        self,
        messages: List[Dict[str, Any]],
        user_id: str,
        investigation_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Process a message and stream the response using Server-Sent Events format
        
        Yields SSE-formatted chunks:
        data: {"type": "step-start"}
        data: {"type": "text", "text": "chunk", "state": "streaming"}
        data: {"type": "text", "text": "final", "state": "done"}
        data: {"type": "sources", "sources": [...]}
        """
        
        print(f"[SCARLET-IA DEBUG] Processing message for user {user_id}")
        print(f"[SCARLET-IA DEBUG] Investigation ID: {investigation_id}")
        print(f"[SCARLET-IA DEBUG] Messages count: {len(messages)}")
        
        # Convert messages to OpenAI format
        openai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        for msg in messages:
            if msg["role"] == "user":
                # Extract text from parts
                text_parts = [p.get("text", "") for p in msg.get("parts", []) if p.get("type") == "text"]
                content = " ".join(text_parts) if text_parts else msg.get("content", "")
                openai_messages.append({"role": "user", "content": content})
                print(f"[SCARLET-IA DEBUG] User message: {content[:100]}...")
            elif msg["role"] == "assistant":
                # Extract text from parts
                text_parts = [p.get("text", "") for p in msg.get("parts", []) if p.get("type") == "text"]
                content = " ".join(text_parts) if text_parts else msg.get("content", "")
                if content:
                    openai_messages.append({"role": "assistant", "content": content})
        
        try:
            # Send step-start event
            print(f"[SCARLET-IA DEBUG] Sending step-start event")
            yield f"data: {json.dumps({'type': 'step-start'})}\n\n"
            
            # Get OpenAI client
            print(f"[SCARLET-IA DEBUG] Getting OpenAI client")
            client = self._get_client()
            
            # Stream response from OpenAI
            print(f"[SCARLET-IA DEBUG] Creating completion stream with model: {self.model}")
            full_response = ""
            stream = await client.chat.completions.create(
                model=self.model,
                messages=openai_messages,
                stream=True,
                temperature=0.7,
                max_tokens=4096
            )
            
            print(f"[SCARLET-IA DEBUG] Starting to stream response")
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    
                    # Send streaming text chunk
                    yield f"data: {json.dumps({'type': 'text', 'text': content, 'state': 'streaming'})}\n\n"
            
            # Send final text chunk with done state
            yield f"data: {json.dumps({'type': 'text', 'text': '', 'state': 'done'})}\n\n"
            
            # TODO: Add sources if we implement web search
            # sources = await self.search_sources(full_response)
            # if sources:
            #     yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
            
            # Send done event
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            # Send error event
            error_msg = f"Erro ao processar mensagem: {str(e)}"
            yield f"data: {json.dumps({'type': 'error', 'error': error_msg})}\n\n"
    
    async def execute_tool(
        self,
        tool_name: str,
        params: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        """Execute a tool and return results"""
        
        # TODO: Implement actual tool execution
        # For now, return mock response
        
        if tool_name.startswith("kali_"):
            return {
                "success": True,
                "tool": tool_name,
                "result": f"[Kali Tool] {tool_name} executado com sucesso. Resultado simulado.",
                "params": params
            }
        else:
            return {
                "success": True,
                "tool": tool_name,
                "result": f"[OSINT Tool] {tool_name} executado com sucesso. Resultado simulado.",
                "params": params
            }
    
    async def get_available_tools(self) -> List[Dict[str, str]]:
        """Get list of available tools"""
        return [
            {"id": "flow_create", "name": "Criar Flow", "category": "osint"},
            {"id": "domain_search", "name": "Busca de Domínio", "category": "osint"},
            {"id": "person_search", "name": "Busca de Pessoas", "category": "osint"},
            {"id": "osint_search", "name": "OSINT Search", "category": "osint"},
            {"id": "data_analysis", "name": "Análise de Dados", "category": "osint"},
            {"id": "face_recognition", "name": "Reconhecimento Facial", "category": "osint"},
            {"id": "kali_nmap", "name": "Nmap", "category": "kali"},
            {"id": "kali_metasploit", "name": "Metasploit", "category": "kali"},
            {"id": "kali_burp", "name": "Burp Suite", "category": "kali"},
            {"id": "kali_wireshark", "name": "Wireshark", "category": "kali"},
            {"id": "kali_sqlmap", "name": "SQLMap", "category": "kali"},
            {"id": "kali_nikto", "name": "Nikto", "category": "kali"},
            {"id": "kali_hydra", "name": "Hydra", "category": "kali"},
            {"id": "kali_aircrack", "name": "Aircrack-ng", "category": "kali"},
            {"id": "kali_john", "name": "John the Ripper", "category": "kali"},
            {"id": "kali_custom", "name": "Comando Kali", "category": "kali"},
        ]


# Singleton instance
scarlet_ia_service = ScarletIAService()
