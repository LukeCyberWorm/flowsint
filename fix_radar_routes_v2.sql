-- Remover a nota anterior
DELETE FROM dossier_notes 
WHERE dossier_id = (SELECT id FROM dossiers WHERE access_token = 'CASO-MOTO-2025-vB3kL9mPq8wN')
AND content LIKE '%# 📡 Rastreamento de Rotas - Radar (DXM2C19)%';

DELETE FROM dossier_notes 
WHERE dossier_id = (SELECT id FROM dossiers WHERE access_token = 'CASO-MOTO-2025-vB3kL9mPq8wN')
AND content LIKE '%# 📡 Registros do Radar%';

-- Inserir a nota formatada em lista/cards
WITH target_dossier AS (
    SELECT id FROM dossiers WHERE access_token = 'CASO-MOTO-2025-vB3kL9mPq8wN'
)
INSERT INTO dossier_notes (id, dossier_id, content, is_pinned, created_at)
VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM target_dossier),
    E'# 📡 Registros do Radar\n\n' ||
    E'**Veículo**: Yamaha Fazer YS250 (DXM2C19)\n' ||
    E'**Total de Registros**: 32\n' ||
    E'**Período**: 24/09/2025 a 20/12/2025\n\n' ||

    E'## 📅 20/12/2025\n' ||
    E'> 🕒 **20:40:18** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. GIOVANNI GRONCHI, 5120 - MORUMBI\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **07:53:41** | 🏙️ **OSASCO**\n' ||
    E'> 📍 AV DOS AUTONOMISTAS SENT - SAINDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 18/12/2025\n' ||
    E'> 🕒 **17:13:45** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. VITAL BRASIL, 730 - BUTANTA\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **17:13:44** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. VITAL BRASIL, 730 - BUTANTA\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **09:49:37** | 🏙️ **CAIEIRAS**\n' ||
    E'> 📍 ROD SP-332 - KM 28 - PROX TREVO LARANJEIRAS\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **09:27:56** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 EST DO PINHEIRINHO - 1730 - SENT ENTRANDO EM CAIEIRAS\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **09:00:31** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. JAGUARE, 719 - JAGUARE\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 16/12/2025\n' ||
    E'> 🕒 **10:31:09** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. ERMANO MARCHETTI, 14 - AGUA BRANCA\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 15/12/2025\n' ||
    E'> 🕒 **09:43:12** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. ENG. HEITOR ANTONIO EIRAS GARCIA, 470B - BUTANTA\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 14/12/2025\n' ||
    E'> 🕒 **16:31:38** | 🏙️ **OSASCO**\n' ||
    E'> 📍 RUA SITIO DO RIBEIRAO SENT - SAINDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **15:40:09** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. DO RIO PEQUENO, 689 - JARDIM IVANA\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **11:06:37** | 🏙️ **OSASCO**\n' ||
    E'> 📍 RUA EDUARDO DE LIMA RODRIGUES SENT - ENTRANDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **10:46:34** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. ENG. HEITOR ANTONIO EIRAS GARCIA, 2790 - JARDIM ESMERALDA\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 10/12/2025\n' ||
    E'> 🕒 **11:32:17** | 🏙️ **OSASCO**\n' ||
    E'> 📍 RUA EDUARDO DE LIMA RODRIGUES SENT - ENTRANDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 05/12/2025\n' ||
    E'> 🕒 **16:42:23** | 🏙️ **OSASCO**\n' ||
    E'> 📍 RUA EDUARDO DE LIMA RODRIGUES SENT - SAINDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **16:39:41** | 🏙️ **OSASCO**\n' ||
    E'> 📍 RUA EDUARDO DE LIMA RODRIGUES SENT - ENTRANDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **16:35:20** | 🏙️ **OSASCO**\n' ||
    E'> 📍 RUA JOAQUIM LAPAS VEIGA SENT - ENTRANDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **16:31:56** | 🏙️ **OSASCO**\n' ||
    E'> 📍 RUA JOAQUIM LAPAS VEIGA SENT - SAINDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 02/12/2025\n' ||
    E'> 🕒 **15:09:21** | 🏙️ **OSASCO**\n' ||
    E'> 📍 RUA KENKITI SHIMOMOTO SENT - ENTRANDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 01/12/2025\n' ||
    E'> 🕒 **10:04:49** | 🏙️ **OSASCO**\n' ||
    E'> 📍 RUA DR CANDIDO MOTA FILHO SENT - SAINDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 26/11/2025\n' ||
    E'> 🕒 **09:31:49** | 🏙️ **OSASCO**\n' ||
    E'> 📍 RUA DR CANDIDO MOTA FILHO SENT - SAINDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 24/11/2025\n' ||
    E'> 🕒 **11:40:24** | 🏙️ **OSASCO**\n' ||
    E'> 📍 AV DOS AUTONOMISTAS SENT - SAINDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 23/11/2025\n' ||
    E'> 🕒 **09:42:29** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 R. AGOSTINHO DE AZEVEDO, 550 - JARDIM BOA VISTA\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 18/11/2025\n' ||
    E'> 🕒 **15:17:55** | 🏙️ **OSASCO**\n' ||
    E'> 📍 AV PRESTES MAIA SENT - SAINDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **11:14:56** | 🏙️ **OSASCO**\n' ||
    E'> 📍 AV PRESTES MAIA SENT - SAINDO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 28/10/2025\n' ||
    E'> 🕒 **16:21:26** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. MAL. MARIO GUEDES, 44 - JAGUARE\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 03/10/2025\n' ||
    E'> 🕒 **23:49:04** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV POMPEIA, 1.536 - SENT R HEITOR PENTEADO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **03:19:05** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. VITAL BRASIL, 160 - BUTANTA\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 27/09/2025\n' ||
    E'> 🕒 **23:38:31** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV POMPEIA, 1.536 - SENT R HEITOR PENTEADO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 26/09/2025\n' ||
    E'> 🕒 **23:39:23** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV POMPEIA, 1.536 - SENT R HEITOR PENTEADO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'> 🕒 **10:13:07** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV. JAGUARE, 719 - JAGUARE\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'## 📅 24/09/2025\n' ||
    E'> 🕒 **23:37:49** | 🏙️ **SÃO PAULO**\n' ||
    E'> 📍 AV POMPEIA, 1.536 - SENT R HEITOR PENTEADO\n' ||
    E'> 🚦 Sem Restrição | 📡 Radar Nacional\n\n' ||

    E'\n## 📊 Análise de Padrões\n\n' ||
    E'1. **Frequência em Osasco**: Alta concentração de registros em Osasco, especialmente nas ruas Eduardo de Lima Rodrigues e Joaquim Lapas Veiga.\n' ||
    E'2. **Rotas Comuns**:\n' ||
    E'   - Deslocamento frequente entre Osasco e Zona Oeste de SP (Butantã/Jaguaré).\n' ||
    E'   - Passagens recorrentes na Av. Vital Brasil e Av. Pompeia.\n' ||
    E'3. **Horários**:\n' ||
    E'   - Padrão misto, com registros tanto em horário comercial quanto noturno (ex: 23:49 na Pompeia).\n',
    false,
    NOW()
);
