#!/usr/bin/env python3
"""
Script de Teste - Work Consultoria API
Testa todos os módulos de veículos disponíveis
"""

import httpx
import json
from datetime import datetime
from typing import Dict, Any


class WorkConsultoriaAPITester:
    """Testa endpoints da Work Consultoria API"""
    
    def __init__(self):
        self.base_url = "https://api.workconsultoria.com/api/v1"
        self.headers = {
            "access-token": "AH_0gMrfF3Us-D__pLdfAA",
            "client": "tr2TUHr37D3qGNFTOZDYqg",
            "expiry": "1766520379",
            "token-type": "Bearer",
            "uid": "lukecyberworm",
            "accept": "application/json, text/plain, */*",
            "Cookie": "cf_clearance=6Hp3qFOWKL8RklCPbHdUTe21bn6C2IJYMnrKu8UGfSg-1766433811-1.2.1.1-7C7Une66RZZ6mcz6nFtgVgBPmujvlDAIaSuQUq3aqipoV0nPlqHRGXVOUCaI07EtnRjrhjtBwkD1JrUT_i0JL4hDiAbvv9i8R1Gg11ptIdsAMEyOWB4Mdg7a4efJ8HEXdlvwa5_ZpLn3NB6lUfxBfAY6g7f.ITUy7jGm1QcKTUBdtZzRuWfUvbWB4jK6JYcMTVN8rzzR4cXmdA1i8lJFis8ulcy5_0Fg4sYWRrEV7dg"
        }
        
        # Placa de teste (exemplo brasileiro)
        self.test_placa = "ABC1234"  # Formato antigo
        self.test_placa_mercosul = "ABC1D23"  # Formato Mercosul
        self.test_chassi = "9BWZZZ377VT004251"
        self.test_renavam = "12345678901"
        
    def test_endpoint(self, module: str, param_key: str, param_value: str) -> Dict[str, Any]:
        """
        Testa um endpoint específico
        
        Args:
            module: Nome do módulo (ex: 'placa', 'chassi')
            param_key: Nome do parâmetro (ex: 'placa', 'chassi')
            param_value: Valor do parâmetro
        """
        endpoint = f"/consults/gate_1/{module}/"
        
        # Testar com query parameter
        url_query = f"{self.base_url}{endpoint}?{param_key}={param_value}"
        
        # Testar com path parameter
        url_path = f"{self.base_url}{endpoint}{param_value}"
        
        result = {
            "module": module,
            "param": f"{param_key}={param_value}",
            "timestamp": datetime.now().isoformat(),
            "tests": []
        }
        
        print(f"\n{'='*80}")
        print(f"TESTANDO MÓDULO: {module}")
        print(f"Parâmetro: {param_key} = {param_value}")
        print(f"{'='*80}")
        
        # Teste 1: Query Parameter
        print(f"\n[1] Testando: GET {endpoint}?{param_key}={param_value}")
        try:
            response = httpx.get(url_query, headers=self.headers, timeout=10.0)
            test_result = {
                "method": "query_parameter",
                "url": url_query,
                "status_code": response.status_code,
                "success": response.status_code == 200
            }
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    test_result["response"] = data
                    test_result["response_size"] = len(json.dumps(data))
                    print(f"✅ SUCESSO! Status: {response.status_code}")
                    print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)[:500]}...")
                except:
                    test_result["response"] = response.text
                    print(f"✅ Status: {response.status_code}, mas resposta não é JSON")
            else:
                test_result["error"] = response.text
                print(f"❌ ERRO! Status: {response.status_code}")
                print(f"Response: {response.text[:200]}")
            
            result["tests"].append(test_result)
            
        except Exception as e:
            print(f"❌ EXCEÇÃO: {str(e)}")
            result["tests"].append({
                "method": "query_parameter",
                "url": url_query,
                "error": str(e),
                "success": False
            })
        
        # Teste 2: Path Parameter
        print(f"\n[2] Testando: GET {endpoint}{param_value}")
        try:
            response = httpx.get(url_path, headers=self.headers, timeout=10.0)
            test_result = {
                "method": "path_parameter",
                "url": url_path,
                "status_code": response.status_code,
                "success": response.status_code == 200
            }
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    test_result["response"] = data
                    test_result["response_size"] = len(json.dumps(data))
                    print(f"✅ SUCESSO! Status: {response.status_code}")
                    print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)[:500]}...")
                except:
                    test_result["response"] = response.text
                    print(f"✅ Status: {response.status_code}, mas resposta não é JSON")
            else:
                test_result["error"] = response.text
                print(f"❌ ERRO! Status: {response.status_code}")
                print(f"Response: {response.text[:200]}")
            
            result["tests"].append(test_result)
            
        except Exception as e:
            print(f"❌ EXCEÇÃO: {str(e)}")
            result["tests"].append({
                "method": "path_parameter",
                "url": url_path,
                "error": str(e),
                "success": False
            })
        
        return result
    
    def test_all_vehicle_modules(self):
        """Testa todos os módulos relacionados a veículos"""
        
        print("\n" + "="*80)
        print("INICIANDO TESTES DE MÓDULOS DE VEÍCULOS - WORK CONSULTORIA API")
        print("="*80)
        
        results = []
        
        # Módulos de veículos identificados
        vehicle_modules = [
            ("placa", "placa", self.test_placa),
            ("placa_veicular", "placa", self.test_placa),
            ("chassi", "chassi", self.test_chassi),
            ("renavam", "renavam", self.test_renavam),
            ("renach", "renach", self.test_renavam),
            ("condutor", "cpf", "04151107690"),  # Pode precisar CPF
            ("proprietario", "cpf", "04151107690"),  # Pode precisar CPF
            ("vistoria_veicular", "placa", self.test_placa),
        ]
        
        for module, param_key, param_value in vehicle_modules:
            result = self.test_endpoint(module, param_key, param_value)
            results.append(result)
        
        # Salvar resultados
        output_file = "work_api_vehicle_tests.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n{'='*80}")
        print(f"TESTES CONCLUÍDOS!")
        print(f"Resultados salvos em: {output_file}")
        print(f"{'='*80}")
        
        # Sumário
        print("\n📊 SUMÁRIO DOS TESTES:")
        for result in results:
            module = result["module"]
            successful_tests = [t for t in result["tests"] if t.get("success", False)]
            total_tests = len(result["tests"])
            success_count = len(successful_tests)
            
            status = "✅" if success_count > 0 else "❌"
            print(f"{status} {module:20s} - {success_count}/{total_tests} testes bem-sucedidos")
            
            if successful_tests:
                for test in successful_tests:
                    print(f"   → {test['method']}: {test['url']}")
        
        return results
    
    def test_other_modules_with_credits(self):
        """Testa módulos com créditos disponíveis"""
        
        print("\n" + "="*80)
        print("TESTANDO MÓDULOS COM CRÉDITOS DISPONÍVEIS")
        print("="*80)
        
        results = []
        
        # Módulos com créditos
        modules_with_credits = [
            ("cpf_completa", "cpf", "04151107690"),
            ("email", "email", "teste@example.com"),
            ("skysix", "cpf", "04151107690"),  # Tentar com CPF
        ]
        
        for module, param_key, param_value in modules_with_credits:
            result = self.test_endpoint(module, param_key, param_value)
            results.append(result)
        
        # Salvar resultados
        output_file = "work_api_credits_tests.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n{'='*80}")
        print(f"Resultados salvos em: {output_file}")
        print(f"{'='*80}")
        
        return results


if __name__ == "__main__":
    tester = WorkConsultoriaAPITester()
    
    print("""
╔═══════════════════════════════════════════════════════════════════════════╗
║                 WORK CONSULTORIA API - TESTE DE MÓDULOS                   ║
║                                                                           ║
║  Este script irá testar:                                                 ║
║  1. Todos os 8 módulos de veículos                                      ║
║  2. Os 3 módulos com créditos disponíveis                               ║
║                                                                           ║
║  ⚠️  ATENÇÃO: Testes com módulos que têm créditos irão CONSUMIR créditos ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
""")
    
    input("Pressione ENTER para iniciar os testes de VEÍCULOS (sem consumir créditos)... ")
    
    # Testar módulos de veículos
    vehicle_results = tester.test_all_vehicle_modules()
    
    print("\n\n")
    choice = input("Deseja testar os módulos COM CRÉDITOS? (irá consumir créditos!) [s/N]: ")
    
    if choice.lower() == 's':
        credit_results = tester.test_other_modules_with_credits()
    
    print("\n✅ Todos os testes concluídos!")
    print("\nArquivos gerados:")
    print("  - work_api_vehicle_tests.json")
    if choice.lower() == 's':
        print("  - work_api_credits_tests.json")
