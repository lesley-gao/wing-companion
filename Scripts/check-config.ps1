param(
    [string]$Environment = "production"
)

Write-Host "Checking configuration files for $Environment..." -ForegroundColor Green
Write-Host ""

$configFile = "backend/appsettings.$Environment.json"
if (Test-Path $configFile) {
    Write-Host "Found config file: $configFile" -ForegroundColor Green
    
    try {
        $config = Get-Content $configFile | ConvertFrom-Json
        
        Write-Host ""
        Write-Host "Email Configuration:" -ForegroundColor Yellow
        Write-Host "  SmtpUsername: $($config.EmailConfiguration.SmtpUsername)"
        Write-Host "  SmtpPassword: $($config.EmailConfiguration.SmtpPassword)"
        Write-Host "  FromEmail: $($config.EmailConfiguration.FromEmail)"
        
        Write-Host ""
        Write-Host "Stripe Configuration:" -ForegroundColor Yellow
        Write-Host "  ApiKey: $($config.Stripe.ApiKey)"
        Write-Host "  PublishableKey: $($config.Stripe.PublishableKey)"
        Write-Host "  WebhookSecret: $($config.Stripe.WebhookSecret)"
        
        Write-Host ""
        Write-Host "JWT Configuration:" -ForegroundColor Yellow
        Write-Host "  SecretKey: $($config.JwtSettings.SecretKey)"
        Write-Host "  Issuer: $($config.JwtSettings.Issuer)"
        Write-Host "  Audience: $($config.JwtSettings.Audience)"
        
        Write-Host ""
        Write-Host "Blob Storage Configuration:" -ForegroundColor Yellow
        Write-Host "  AccountName: $($config.BlobStorage.AccountName)"
        Write-Host "  VerificationContainer: $($config.BlobStorage.VerificationContainer)"
        
    } catch {
        Write-Host "Error reading config file: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Config file not found: $configFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "Configuration check complete!" -ForegroundColor Green 