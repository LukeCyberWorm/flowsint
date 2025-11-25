"""
LLM Service using Gemini API
Provides contextual analysis and report generation
"""

import google.generativeai as genai
from typing import Dict, List, Optional
import logging
import os
import json

logger = logging.getLogger(__name__)


class LLMService:
    """
    Wrapper for Gemini API operations
    Generates contextual analysis and reports from face recognition data
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini API client
        
        Args:
            api_key: Gemini API key (or from environment)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not provided")
        
        genai.configure(api_key=self.api_key)
        # Use gemini-pro which is more stable than gemini-1.5-pro
        self.model = genai.GenerativeModel('gemini-pro')
        logger.info("Gemini API initialized with gemini-pro model")
    
    def generate_profile_analysis(
        self,
        face_data: Dict,
        osint_results: List[Dict],
        geolocation: Optional[Dict] = None
    ) -> str:
        """
        Generate comprehensive profile analysis using LLM
        
        Args:
            face_data: Face detection results (age, gender, etc.)
            osint_results: Social media profiles found
            geolocation: Location data from image
            
        Returns:
            Formatted analysis report
        """
        try:
            # Build prompt
            prompt = self._build_analysis_prompt(face_data, osint_results, geolocation)
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            logger.info("Profile analysis generated successfully")
            return response.text
            
        except Exception as e:
            logger.error(f"LLM analysis error: {e}")
            return f"Error generating analysis: {str(e)}"
    
    def _build_analysis_prompt(
        self,
        face_data: Dict,
        osint_results: List[Dict],
        geolocation: Optional[Dict]
    ) -> str:
        """Build structured prompt for Gemini"""
        
        prompt_parts = [
            "Você é um analista forense especializado em reconhecimento facial e OSINT.",
            "Analise os dados a seguir e forneça um relatório estruturado.",
            "",
            "## DADOS FACIAIS",
        ]
        
        # Add face data
        if face_data.get("faces"):
            face = face_data["faces"][0]
            prompt_parts.extend([
                f"- Idade estimada: {face.get('age', 'N/A')}",
                f"- Gênero: {face.get('gender', 'N/A')}",
                f"- Confiança da detecção: {face.get('det_score', 0) * 100:.1f}%",
            ])
        
        # Add OSINT results
        prompt_parts.extend([
            "",
            "## PERFIS ENCONTRADOS (OSINT)",
        ])
        
        if osint_results:
            for result in osint_results:
                prompt_parts.extend([
                    f"- Plataforma: {result.get('platform', 'N/A')}",
                    f"  - URL: {result.get('profile_url', 'N/A')}",
                    f"  - Confiança: {result.get('confidence_score', 0) * 100:.1f}%",
                ])
        else:
            prompt_parts.append("Nenhum perfil encontrado.")
        
        # Add geolocation
        if geolocation:
            prompt_parts.extend([
                "",
                "## GEOLOCALIZAÇÃO",
                f"- Local: {geolocation.get('location_name', 'N/A')}",
                f"- Coordenadas: {geolocation.get('latitude', 'N/A')}, {geolocation.get('longitude', 'N/A')}",
                f"- Fonte: {geolocation.get('source', 'N/A')}",
                f"- Confiança: {geolocation.get('confidence', 0) * 100:.1f}%",
            ])
        
        # Add analysis instructions
        prompt_parts.extend([
            "",
            "## INSTRUÇÕES",
            "Forneça um relatório estruturado contendo:",
            "1. Resumo executivo (3-5 linhas)",
            "2. Análise dos dados faciais",
            "3. Avaliação dos perfis sociais encontrados",
            "4. Análise de geolocalização (se disponível)",
            "5. Nível de confiança geral (Alto/Médio/Baixo)",
            "6. Recomendações para investigação adicional",
            "",
            "IMPORTANTE: Mantenha o tom profissional e objetivo. Não faça suposições sem dados.",
        ])
        
        return "\n".join(prompt_parts)
    
    def generate_investigation_report(
        self,
        analysis: str,
        metadata: Dict
    ) -> Dict:
        """
        Generate structured investigation report
        
        Args:
            analysis: LLM-generated analysis
            metadata: Additional metadata (timestamp, investigator, etc.)
            
        Returns:
            Structured report as dictionary
        """
        try:
            report = {
                "report_id": metadata.get("report_id", "unknown"),
                "timestamp": metadata.get("timestamp"),
                "investigator": metadata.get("investigator", "system"),
                "analysis": analysis,
                "confidence_level": self._extract_confidence_level(analysis),
                "recommendations": self._extract_recommendations(analysis),
                "metadata": metadata
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Report generation error: {e}")
            raise
    
    def _extract_confidence_level(self, analysis: str) -> str:
        """Extract confidence level from analysis text"""
        analysis_lower = analysis.lower()
        if "alto" in analysis_lower or "alta" in analysis_lower:
            return "HIGH"
        elif "médio" in analysis_lower or "média" in analysis_lower:
            return "MEDIUM"
        elif "baixo" in analysis_lower or "baixa" in analysis_lower:
            return "LOW"
        return "UNKNOWN"
    
    def _extract_recommendations(self, analysis: str) -> List[str]:
        """Extract recommendations from analysis text"""
        # Simple extraction - look for numbered or bulleted lists
        recommendations = []
        lines = analysis.split("\n")
        
        in_recommendations = False
        for line in lines:
            if "recomendações" in line.lower() or "recomendação" in line.lower():
                in_recommendations = True
                continue
            
            if in_recommendations:
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith("-") or line.startswith("•")):
                    recommendations.append(line.lstrip("0123456789.-• "))
        
        return recommendations


# Singleton instance
_llm_service_instance: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create LLMService singleton"""
    global _llm_service_instance
    if _llm_service_instance is None:
        _llm_service_instance = LLMService()
    return _llm_service_instance
