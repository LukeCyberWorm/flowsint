-- Inserir registros de radar para o caso INV-2025-1222-001
WITH target_dossier AS (
    SELECT id FROM dossiers WHERE access_token = 'CASO-MOTO-2025-vB3kL9mPq8wN'
)
INSERT INTO dossier_notes (id, dossier_id, content, is_pinned, created_at)
VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM target_dossier),
    '# 📡 Rastreamento de Rotas - Radar (DXM2C19)

**Veículo**: Yamaha Fazer YS250 (DXM2C19)
**Total de Registros**: 32
**Período**: 24/09/2025 a 20/12/2025

## 🗺️ Histórico de Detecções

| Data/Hora | Localização | Cidade | Situação |
|-----------|-------------|--------|----------|
| 20/12/2025 20:40:18 | AV. GIOVANNI GRONCHI, 5120 - MORUMBI | SÃO PAULO | Sem Restrição |
| 20/12/2025 07:53:41 | AV DOS AUTONOMISTAS SENT - SAINDO | OSASCO | Sem Restrição |
| 18/12/2025 17:13:45 | AV. VITAL BRASIL, 730 - BUTANTA | SÃO PAULO | Sem Restrição |
| 18/12/2025 17:13:44 | AV. VITAL BRASIL, 730 - BUTANTA | SÃO PAULO | Sem Restrição |
| 18/12/2025 09:49:37 | ROD SP-332 - KM 28 - PROX TREVO LARANJEIRAS | CAIEIRAS | Sem Restrição |
| 18/12/2025 09:27:56 | EST DO PINHEIRINHO - 1730 - SENT ENTRANDO EM CAIEIRAS | SÃO PAULO | Sem Restrição |
| 18/12/2025 09:00:31 | AV. JAGUARE, 719 - JAGUARE | SÃO PAULO | Sem Restrição |
| 16/12/2025 10:31:09 | AV. ERMANO MARCHETTI, 14 - AGUA BRANCA | SÃO PAULO | Sem Restrição |
| 15/12/2025 09:43:12 | AV. ENG. HEITOR ANTONIO EIRAS GARCIA, 470B - BUTANTA | SÃO PAULO | Sem Restrição |
| 14/12/2025 16:31:38 | RUA SITIO DO RIBEIRAO SENT - SAINDO | OSASCO | Sem Restrição |
| 14/12/2025 15:40:09 | AV. DO RIO PEQUENO, 689 - JARDIM IVANA | SÃO PAULO | Sem Restrição |
| 14/12/2025 11:06:37 | RUA EDUARDO DE LIMA RODRIGUES SENT - ENTRANDO | OSASCO | Sem Restrição |
| 14/12/2025 10:46:34 | AV. ENG. HEITOR ANTONIO EIRAS GARCIA, 2790 - JARDIM ESMERALDA | SÃO PAULO | Sem Restrição |
| 10/12/2025 11:32:17 | RUA EDUARDO DE LIMA RODRIGUES SENT - ENTRANDO | OSASCO | Sem Restrição |
| 05/12/2025 16:42:23 | RUA EDUARDO DE LIMA RODRIGUES SENT - SAINDO | OSASCO | Sem Restrição |
| 05/12/2025 16:39:41 | RUA EDUARDO DE LIMA RODRIGUES SENT - ENTRANDO | OSASCO | Sem Restrição |
| 05/12/2025 16:35:20 | RUA JOAQUIM LAPAS VEIGA SENT - ENTRANDO | OSASCO | Sem Restrição |
| 05/12/2025 16:31:56 | RUA JOAQUIM LAPAS VEIGA SENT - SAINDO | OSASCO | Sem Restrição |
| 02/12/2025 15:09:21 | RUA KENKITI SHIMOMOTO SENT - ENTRANDO | OSASCO | Sem Restrição |
| 01/12/2025 10:04:49 | RUA DR CANDIDO MOTA FILHO SENT - SAINDO | OSASCO | Sem Restrição |
| 26/11/2025 09:31:49 | RUA DR CANDIDO MOTA FILHO SENT - SAINDO | OSASCO | Sem Restrição |
| 24/11/2025 11:40:24 | AV DOS AUTONOMISTAS SENT - SAINDO | OSASCO | Sem Restrição |
| 23/11/2025 09:42:29 | R. AGOSTINHO DE AZEVEDO, 550 - JARDIM BOA VISTA | SÃO PAULO | Sem Restrição |
| 18/11/2025 15:17:55 | AV PRESTES MAIA SENT - SAINDO | OSASCO | Sem Restrição |
| 18/11/2025 11:14:56 | AV PRESTES MAIA SENT - SAINDO | OSASCO | Sem Restrição |
| 28/10/2025 16:21:26 | AV. MAL. MARIO GUEDES, 44 - JAGUARE | SÃO PAULO | Sem Restrição |
| 03/10/2025 23:49:04 | AV POMPEIA, 1.536 - SENT R HEITOR PENTEADO | SÃO PAULO | Sem Restrição |
| 03/10/2025 03:19:05 | AV. VITAL BRASIL, 160 - BUTANTA | SÃO PAULO | Sem Restrição |
| 27/09/2025 23:38:31 | AV POMPEIA, 1.536 - SENT R HEITOR PENTEADO | SÃO PAULO | Sem Restrição |
| 26/09/2025 23:39:23 | AV POMPEIA, 1.536 - SENT R HEITOR PENTEADO | SÃO PAULO | Sem Restrição |
| 26/09/2025 10:13:07 | AV. JAGUARE, 719 - JAGUARE | SÃO PAULO | Sem Restrição |
| 24/09/2025 23:37:49 | AV POMPEIA, 1.536 - SENT R HEITOR PENTEADO | SÃO PAULO | Sem Restrição |

## 📊 Análise de Padrões

1. **Frequência em Osasco**: Alta concentração de registros em Osasco, especialmente nas ruas Eduardo de Lima Rodrigues e Joaquim Lapas Veiga.
2. **Rotas Comuns**:
   - Deslocamento frequente entre Osasco e Zona Oeste de SP (Butantã/Jaguaré).
   - Passagens recorrentes na Av. Vital Brasil e Av. Pompeia.
3. **Horários**:
   - Padrão misto, com registros tanto em horário comercial quanto noturno (ex: 23:49 na Pompeia).
',
    false,
    NOW()
);
