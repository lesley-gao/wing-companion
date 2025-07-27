param(
    [string]$Environment = "production"
)

Write-Host "Checking environment variables for $Environment..." -ForegroundColor Green
Write-Host ""

# Check backend environment variables
Write-Host "Backend Variables:" -ForegroundColor Yellow

$backendVars = @(
    "ConnectionStrings__DefaultConnection",
    "ConnectionStrings__ApplicationInsights", 
    "AZURE_BLOB_CONNECTION_STRING",
    "APPLICATIONINSIGHTS_CONNECTION_STRING",
    "ASPNETCORE_ENVIRONMENT"
)

foreach ($var in $backendVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "  ✅ $var" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $var" -ForegroundColor Red
    }
}

Write-Host ""

# Check frontend environment variables
Write-Host "Frontend Variables:" -ForegroundColor Yellow

$frontendVars = @(
    "REACT_APP_API_BASE_URL",
    "REACT_APP_SIGNALR_HUB_URL"
)

foreach ($var in $frontendVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "  ✅ $var" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $var" -ForegroundColor Red
    }
}

Write-Host ""

# Check Azure variables if production
if ($Environment -eq "production") {
    Write-Host "Azure Variables:" -ForegroundColor Yellow
    
    $azureVars = @(
        "AZURE_CLIENT_ID",
        "AZURE_CLIENT_SECRET", 
        "AZURE_TENANT_ID",
        "AZURE_SUBSCRIPTION_ID",
        "AZURE_RESOURCE_GROUP",
        "AZURE_ENV_NAME",
        "AZURE_LOCATION"
    )
    
    foreach ($var in $azureVars) {
        $value = [Environment]::GetEnvironmentVariable($var)
        if ($value) {
            Write-Host "  ✅ $var" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $var" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Check complete!" -ForegroundColor Green 