# Script para configurar Railway via API
# Token Railway: f747a907-ce94-4e11-8689-2c30d68d36f8

$RAILWAY_TOKEN = "f747a907-ce94-4e11-8689-2c30d68d36f8"
$PROJECT_ID = "73e89fe9-8940-40e7-8cc8-069f9440c83d"
$GITHUB_REPO = "LukeCyberWorm/flowsint"

$headers = @{
    "Authorization" = "Bearer $RAILWAY_TOKEN"
    "Content-Type"  = "application/json"
}

Write-Host "🚀 Configurando Railway via API..." -ForegroundColor Cyan
Write-Host ""

# GraphQL endpoint
$apiUrl = "https://backboard.railway.app/graphql/v2"

# 1. Listar serviços atuais
Write-Host "📋 Listando serviços atuais..." -ForegroundColor Yellow

$queryServices = @{
    query = @"
    query {
      services(projectId: "$PROJECT_ID") {
        edges {
          node {
            id
            name
          }
        }
      }
    }
"@
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $queryServices
    $services = $response.data.services.edges
    
    Write-Host "  Serviços encontrados: $($services.Count)" -ForegroundColor Green
    
    foreach ($edge in $services) {
        $service = $edge.node
        Write-Host "  - $($service.name) (ID: $($service.id))" -ForegroundColor Gray
    }
    
    Write-Host ""
    
    # 2. Deletar serviços antigos se existirem
    Write-Host "🗑️ Deletando serviços com erro..." -ForegroundColor Yellow
    
    foreach ($edge in $services) {
        $service = $edge.node
        if ($service.name -match "flowsint|dossie") {
            Write-Host "  Deletando: $($service.name)..." -ForegroundColor Red
            
            $deleteMutation = @{
                query = @"
                mutation {
                  serviceDelete(id: "$($service.id)")
                }
"@
            } | ConvertTo-Json
            
            try {
                Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $deleteMutation | Out-Null
                Write-Host "  ✅ Deletado!" -ForegroundColor Green
            }
            catch {
                Write-Host "  ⚠️ Erro ao deletar: $_" -ForegroundColor Yellow
            }
        }
    }
    
    Start-Sleep -Seconds 2
    Write-Host ""
    
    # 3. Criar serviço Client
    Write-Host "📦 Criando serviço Frontend Client..." -ForegroundColor Yellow
    
    $createClientMutation = @{
        query = @"
        mutation {
          serviceCreate(input: {
            projectId: "$PROJECT_ID"
            name: "dossier-client"
            source: {
              repo: "$GITHUB_REPO"
              rootDirectory: "flowsint-dossier"
            }
          }) {
            id
            name
          }
        }
"@
    } | ConvertTo-Json
    
    $clientService = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $createClientMutation
    $clientId = $clientService.data.serviceCreate.id
    
    Write-Host "  ✅ Serviço criado: $($clientService.data.serviceCreate.name)" -ForegroundColor Green
    Write-Host "  ID: $clientId" -ForegroundColor Gray
    
    # 4. Adicionar variáveis de ambiente ao Client
    Write-Host "  Configurando variáveis..." -ForegroundColor Gray
    
    $variables = @(
        @{ key = "VITE_API_URL"; value = "https://api.scarletredsolutions.com" }
        @{ key = "NODE_ENV"; value = "production" }
    )
    
    foreach ($var in $variables) {
        $varMutation = @{
            query = @"
            mutation {
              variableUpsert(input: {
                serviceId: "$clientId"
                name: "$($var.key)"
                value: "$($var.value)"
              })
            }
"@
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $varMutation | Out-Null
        Write-Host "    ✓ $($var.key)" -ForegroundColor Green
    }
    
    # 5. Configurar domínio customizado Client
    Write-Host "  Configurando domínio customizado..." -ForegroundColor Gray
    
    $domainMutation = @{
        query = @"
        mutation {
          customDomainCreate(input: {
            serviceId: "$clientId"
            domain: "dossie.scarletredsolutions.com"
          }) {
            id
            domain
          }
        }
"@
    } | ConvertTo-Json
    
    try {
        $domain = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $domainMutation
        Write-Host "    ✓ dossie.scarletredsolutions.com" -ForegroundColor Green
    }
    catch {
        Write-Host "    ⚠️ Domínio já existe ou erro: $_" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # 6. Criar serviço Admin
    Write-Host "📦 Criando serviço Frontend Admin..." -ForegroundColor Yellow
    
    $createAdminMutation = @{
        query = @"
        mutation {
          serviceCreate(input: {
            projectId: "$PROJECT_ID"
            name: "dossier-admin"
            source: {
              repo: "$GITHUB_REPO"
              rootDirectory: "flowsint-dossier-admin"
            }
          }) {
            id
            name
          }
        }
"@
    } | ConvertTo-Json
    
    $adminService = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $createAdminMutation
    $adminId = $adminService.data.serviceCreate.id
    
    Write-Host "  ✅ Serviço criado: $($adminService.data.serviceCreate.name)" -ForegroundColor Green
    Write-Host "  ID: $adminId" -ForegroundColor Gray
    
    # 7. Adicionar variáveis de ambiente ao Admin
    Write-Host "  Configurando variáveis..." -ForegroundColor Gray
    
    foreach ($var in $variables) {
        $varMutation = @{
            query = @"
            mutation {
              variableUpsert(input: {
                serviceId: "$adminId"
                name: "$($var.key)"
                value: "$($var.value)"
              })
            }
"@
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $varMutation | Out-Null
        Write-Host "    ✓ $($var.key)" -ForegroundColor Green
    }
    
    # 8. Configurar domínio customizado Admin
    Write-Host "  Configurando domínio customizado..." -ForegroundColor Gray
    
    $domainAdminMutation = @{
        query = @"
        mutation {
          customDomainCreate(input: {
            serviceId: "$adminId"
            domain: "adm-dossie.scarletredsolutions.com"
          }) {
            id
            domain
          }
        }
"@
    } | ConvertTo-Json
    
    try {
        $domainAdmin = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $domainAdminMutation
        Write-Host "    ✓ adm-dossie.scarletredsolutions.com" -ForegroundColor Green
    }
    catch {
        Write-Host "    ⚠️ Domínio já existe ou erro: $_" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "✨ Configuração concluída!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Resumo:" -ForegroundColor Cyan
    Write-Host "  • Serviço Client: dossier-client" -ForegroundColor White
    Write-Host "    - Root: flowsint-dossier" -ForegroundColor Gray
    Write-Host "    - Domínio: dossie.scarletredsolutions.com" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  • Serviço Admin: dossier-admin" -ForegroundColor White
    Write-Host "    - Root: flowsint-dossier-admin" -ForegroundColor Gray
    Write-Host "    - Domínio: adm-dossie.scarletredsolutions.com" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔄 Os deploys devem iniciar automaticamente!" -ForegroundColor Yellow
    Write-Host "   Acompanhe em: https://railway.app/project/$PROJECT_ID" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⏱️ Próximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Aguardar deploy (3-5 minutos)" -ForegroundColor White
    Write-Host "  2. Atualizar CNAMEs no Cloudflare com os do Railway" -ForegroundColor White
    Write-Host "  3. Testar os domínios!" -ForegroundColor White
    
}
catch {
    Write-Host "❌ Erro ao executar: $_" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Message)" -ForegroundColor Red
}
