# Script simplificado para criar serviços no Railway
$RAILWAY_TOKEN = "f747a907-ce94-4e11-8689-2c30d68d36f8"
$PROJECT_ID = "73e89fe9-8940-40e7-8cc8-069f9440c83d"
$ENVIRONMENT_ID = "d1e24d2e-cfb2-4283-8fd3-bcf78adb7c5b"  # production environment

$headers = @{
    "Authorization" = "Bearer $RAILWAY_TOKEN"
    "Content-Type"  = "application/json"
}

$apiUrl = "https://backboard.railway.app/graphql/v2"

Write-Host "🚀 Criando serviços no Railway..." -ForegroundColor Cyan
Write-Host ""

# 1. Criar serviço Client
Write-Host "📦 Criando Frontend Client..." -ForegroundColor Yellow

$createClient = @{
    query     = "mutation serviceCreate(`$input: ServiceCreateInput!) { serviceCreate(input: `$input) { id name } }"
    variables = @{
        input = @{
            projectId = $PROJECT_ID
            name      = "dossier-client"
            source    = @{
                repo          = "LukeCyberWorm/flowsint"
                rootDirectory = "flowsint-dossier"
            }
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $client = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $createClient
    
    if ($client.data.serviceCreate) {
        $clientId = $client.data.serviceCreate.id
        Write-Host "  ✅ Criado: $($client.data.serviceCreate.name)" -ForegroundColor Green
        Write-Host "  ID: $clientId" -ForegroundColor Gray
        
        # Adicionar variáveis
        Write-Host "  Configurando variáveis..." -ForegroundColor Gray
        
        $vars = @(
            @{name = "VITE_API_URL"; value = "https://api.scarletredsolutions.com" }
            @{name = "NODE_ENV"; value = "production" }
        )
        
        foreach ($var in $vars) {
            $varCreate = @{
                query     = "mutation variableUpsert(`$input: VariableUpsertInput!) { variableUpsert(input: `$input) }"
                variables = @{
                    input = @{
                        projectId     = $PROJECT_ID
                        environmentId = $ENVIRONMENT_ID
                        serviceId     = $clientId
                        name          = $var.name
                        value         = $var.value
                    }
                }
            } | ConvertTo-Json -Depth 10
            
            Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $varCreate | Out-Null
            Write-Host "    ✓ $($var.name)" -ForegroundColor Green
        }
        
        # Adicionar domínio
        Write-Host "  Adicionando domínio..." -ForegroundColor Gray
        $domainCreate = @{
            query     = "mutation customDomainCreate(`$input: CustomDomainCreateInput!) { customDomainCreate(input: `$input) { id domain } }"
            variables = @{
                input = @{
                    projectId     = $PROJECT_ID
                    environmentId = $ENVIRONMENT_ID
                    serviceId     = $clientId
                    domain        = "dossie.scarletredsolutions.com"
                }
            }
        } | ConvertTo-Json -Depth 10
        
        try {
            Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $domainCreate | Out-Null
            Write-Host "    ✓ dossie.scarletredsolutions.com" -ForegroundColor Green
        }
        catch {
            Write-Host "    ⚠️ Domínio pode já existir" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Criar serviço Admin
Write-Host "📦 Criando Frontend Admin..." -ForegroundColor Yellow

$createAdmin = @{
    query     = "mutation serviceCreate(`$input: ServiceCreateInput!) { serviceCreate(input: `$input) { id name } }"
    variables = @{
        input = @{
            projectId = $PROJECT_ID
            name      = "dossier-admin"
            source    = @{
                repo          = "LukeCyberWorm/flowsint"
                rootDirectory = "flowsint-dossier-admin"
            }
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $admin = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $createAdmin
    
    if ($admin.data.serviceCreate) {
        $adminId = $admin.data.serviceCreate.id
        Write-Host "  ✅ Criado: $($admin.data.serviceCreate.name)" -ForegroundColor Green
        Write-Host "  ID: $adminId" -ForegroundColor Gray
        
        # Adicionar variáveis
        Write-Host "  Configurando variáveis..." -ForegroundColor Gray
        
        foreach ($var in $vars) {
            $varCreate = @{
                query     = "mutation variableUpsert(`$input: VariableUpsertInput!) { variableUpsert(input: `$input) }"
                variables = @{
                    input = @{
                        projectId     = $PROJECT_ID
                        environmentId = $ENVIRONMENT_ID
                        serviceId     = $adminId
                        name          = $var.name
                        value         = $var.value
                    }
                }
            } | ConvertTo-Json -Depth 10
            
            Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $varCreate | Out-Null
            Write-Host "    ✓ $($var.name)" -ForegroundColor Green
        }
        
        # Adicionar domínio
        Write-Host "  Adicionando domínio..." -ForegroundColor Gray
        $domainCreate = @{
            query     = "mutation customDomainCreate(`$input: CustomDomainCreateInput!) { customDomainCreate(input: `$input) { id domain } }"
            variables = @{
                input = @{
                    projectId     = $PROJECT_ID
                    environmentId = $ENVIRONMENT_ID
                    serviceId     = $adminId
                    domain        = "adm-dossie.scarletredsolutions.com"
                }
            }
        } | ConvertTo-Json -Depth 10
        
        try {
            Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $domainCreate | Out-Null
            Write-Host "    ✓ adm-dossie.scarletredsolutions.com" -ForegroundColor Green
        }
        catch {
            Write-Host "    ⚠️ Domínio pode já existir" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Serviços criados!" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Acompanhe o deploy em:" -ForegroundColor Cyan
Write-Host "   https://railway.app/project/$PROJECT_ID" -ForegroundColor Gray
