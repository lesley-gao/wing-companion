# CreateUserSettingsMigration.ps1
# Script to create the UserSettings migration when the application is not running

Write-Host "Creating UserSettings migration..." -ForegroundColor Yellow

# Change to the project directory
$projectPath = "d:\Microsoft Student Accelerator 2025\Stage 2\NetworkingApp"
Set-Location $projectPath

# Stop any running instances of the application
Write-Host "Stopping any running NetworkingApp processes..." -ForegroundColor Yellow
$processes = Get-Process -Name "NetworkingApp" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "Stopped $($processes.Count) NetworkingApp process(es)" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Clean the build artifacts
Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow
dotnet clean --verbosity quiet

# Create the migration
Write-Host "Creating AddUserSettings migration..." -ForegroundColor Yellow
$migrationResult = dotnet ef migrations add AddUserSettings

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration created successfully!" -ForegroundColor Green
    
    # Optionally update the database
    $updateDb = Read-Host "Do you want to update the database now? (y/N)"
    if ($updateDb -eq "y" -or $updateDb -eq "Y") {
        Write-Host "Updating database..." -ForegroundColor Yellow
        dotnet ef database update
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database updated successfully!" -ForegroundColor Green
        } else {
            Write-Host "Database update failed!" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Migration creation failed!" -ForegroundColor Red
    Write-Host "Please ensure no processes are using the output files and try again." -ForegroundColor Yellow
}

Write-Host "Script completed." -ForegroundColor Cyan
