param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("development", "production", "test")]
    [string]$Environment,
    
    [Parameter(Mandatory = $false)]
    [string]$ConfigPath = "."
)

function Write-ValidationResult {
    param(
        [string]$VariableName,
        [bool]$IsSet,
        [string]$Description = ""
    )
    
    if ($IsSet) {
        Write-Host "✅ $VariableName" -ForegroundColor Green
    } else {
        Write-Host "❌ $VariableName" -ForegroundColor Red
        if ($Description) {
            Write-Host "   $Description" -ForegroundColor Yellow
        }
    }
}

function Test-EnvironmentVariable {
    param(
        [string]$VariableName,
        [string]$Description = ""
    )
    
    $value = [Environment]::GetEnvironmentVariable($VariableName)
    $isSet = -not [string]::IsNullOrEmpty($value)
    
    Write-ValidationResult -VariableName $VariableName -IsSet $isSet -Description $Description
    return $isSet
}

function Test-ConfigurationValue {
    param(
        [string]$ConfigPath,
        [string]$Key,
        [string]$Description = ""
    )
    
    $configFile = Join-Path $ConfigPath "appsettings.$Environment.json"
    if (Test-Path $configFile) {
        try {
            $config = Get-Content $configFile | ConvertFrom-Json
            $value = $config
            
            $keyParts = $Key.Split(':')
            foreach ($part in $keyParts) {
                if ($value.PSObject.Properties.Name -contains $part) {
                    $value = $value.$part
                } else {
                    $value = $null
                    break
                }
            }
            
            $isSet = -not [string]::IsNullOrEmpty($value) -and $value -ne "placeholder" -and $value -notlike "*REPLACE*"
            Write-ValidationResult -VariableName "Config:$Key" -IsSet $isSet -Description $Description
            return $isSet
        } catch {
            Write-ValidationResult -VariableName "Config:$Key" -IsSet $false -Description "Error reading config file: $($_.Exception.Message)"
            return $false
        }
    } else {
        Write-ValidationResult -VariableName "Config:$Key" -IsSet $false -Description "Config file not found: $configFile"
        return $false
    }
}

Write-Host "🔍 Validating environment variables for $Environment environment..." -ForegroundColor Cyan
Write-Host ""

$allValid = $true

Write-Host "📋 Backend (.NET) Environment Variables:" -ForegroundColor Yellow

$allValid = $allValid -and (Test-EnvironmentVariable "ConnectionStrings__DefaultConnection" "Database connection string")
$allValid = $allValid -and (Test-EnvironmentVariable "ConnectionStrings__ApplicationInsights" "Application Insights connection string")
$allValid = $allValid -and (Test-EnvironmentVariable "AZURE_BLOB_CONNECTION_STRING" "Azure Blob Storage connection string")
$allValid = $allValid -and (Test-ConfigurationValue $ConfigPath "EmailConfiguration:SmtpUsername" "SMTP username")
$allValid = $allValid -and (Test-ConfigurationValue $ConfigPath "EmailConfiguration:SmtpPassword" "SMTP password")
$allValid = $allValid -and (Test-ConfigurationValue $ConfigPath "EmailConfiguration:FromEmail" "Sender email address")
$allValid = $allValid -and (Test-ConfigurationValue $ConfigPath "Stripe:ApiKey" "Stripe secret key")
$allValid = $allValid -and (Test-ConfigurationValue $ConfigPath "Stripe:PublishableKey" "Stripe publishable key")
$allValid = $allValid -and (Test-ConfigurationValue $ConfigPath "Stripe:WebhookSecret" "Stripe webhook secret")
$allValid = $allValid -and (Test-ConfigurationValue $ConfigPath "JwtSettings:SecretKey" "JWT secret key (min 32 chars)")
$allValid = $allValid -and (Test-ConfigurationValue $ConfigPath "JwtSettings:Issuer" "JWT issuer")
$allValid = $allValid -and (Test-ConfigurationValue $ConfigPath "JwtSettings:Audience" "JWT audience")
$allValid = $allValid -and (Test-EnvironmentVariable "APPLICATIONINSIGHTS_CONNECTION_STRING" "Application Insights connection string")
$allValid = $allValid -and (Test-EnvironmentVariable "ASPNETCORE_ENVIRONMENT" "ASP.NET Core environment")

Write-Host ""

Write-Host "📋 Frontend (React) Environment Variables:" -ForegroundColor Yellow

$frontendConfigPath = Join-Path $ConfigPath "frontend"
if (Test-Path $frontendConfigPath) {
    $allValid = $allValid -and (Test-EnvironmentVariable "REACT_APP_STRIPE_PUBLISHABLE_KEY" "Stripe publishable key for frontend")
    $allValid = $allValid -and (Test-EnvironmentVariable "REACT_APP_API_BASE_URL" "Backend API base URL")
    $allValid = $allValid -and (Test-EnvironmentVariable "REACT_APP_SIGNALR_HUB_URL" "SignalR hub URL")
    
    if ($Environment -eq "production") {
        $allValid = $allValid -and (Test-EnvironmentVariable "VITE_CDN_BASE_URL" "CDN base URL")
        $allValid = $allValid -and (Test-EnvironmentVariable "VITE_CDN_STATIC_ASSETS_URL" "CDN static assets URL")
        $allValid = $allValid -and (Test-EnvironmentVariable "VITE_CDN_APP_URL" "CDN app URL")
    }
} else {
    Write-Host "⚠️  Frontend directory not found at: $frontendConfigPath" -ForegroundColor Yellow
}

Write-Host ""

if ($Environment -eq "production" -or $Environment -eq "test") {
    Write-Host "📋 Azure Deployment Variables:" -ForegroundColor Yellow
    
    $allValid = $allValid -and (Test-EnvironmentVariable "AZURE_CLIENT_ID" "Azure Service Principal Client ID")
    $allValid = $allValid -and (Test-EnvironmentVariable "AZURE_CLIENT_SECRET" "Azure Service Principal Client Secret")
    $allValid = $allValid -and (Test-EnvironmentVariable "AZURE_TENANT_ID" "Azure Tenant ID")
    $allValid = $allValid -and (Test-EnvironmentVariable "AZURE_SUBSCRIPTION_ID" "Azure Subscription ID")
    $allValid = $allValid -and (Test-EnvironmentVariable "AZURE_RESOURCE_GROUP" "Azure Resource Group")
    $allValid = $allValid -and (Test-EnvironmentVariable "AZURE_ENV_NAME" "Azure Environment Name")
    $allValid = $allValid -and (Test-EnvironmentVariable "AZURE_LOCATION" "Azure Location")
    
    Write-Host ""
}

Write-Host "📊 Validation Summary:" -ForegroundColor Cyan
if ($allValid) {
    Write-Host "✅ All required environment variables are properly configured!" -ForegroundColor Green
    Write-Host "🚀 Ready for deployment to $Environment environment." -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some environment variables are missing or improperly configured." -ForegroundColor Red
    Write-Host "🔧 Please review the missing variables above and configure them before deployment." -ForegroundColor Yellow
    exit 1
} 