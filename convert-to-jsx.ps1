# PowerShell Script to Convert TypeScript (.tsx) to JavaScript (.jsx)
# This script will:
# 1. Rename all .tsx files to .jsx
# 2. Update all import statements from .tsx to .jsx

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TypeScript to JavaScript Conversion" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "D:\WhyFPT\swd392\code\CSMS\SWD392-CSMS-FrontEnd"
$srcFolder = Join-Path $projectRoot "src"

# Step 1: Find all .tsx files
Write-Host "Step 1: Finding all .tsx files..." -ForegroundColor Yellow
$tsxFiles = Get-ChildItem -Path $srcFolder -Filter "*.tsx" -Recurse -File
Write-Host "Found $($tsxFiles.Count) .tsx files" -ForegroundColor Green
Write-Host ""

# Step 2: Rename .tsx to .jsx
Write-Host "Step 2: Renaming .tsx files to .jsx..." -ForegroundColor Yellow
$renamedCount = 0
foreach ($file in $tsxFiles) {
    $newName = $file.FullName -replace '\.tsx$', '.jsx'
    Rename-Item -Path $file.FullName -NewName $newName -Force
    $renamedCount++
    Write-Host "  Renamed: $($file.Name) -> $([System.IO.Path]::GetFileName($newName))" -ForegroundColor Gray
}
Write-Host "Renamed $renamedCount files" -ForegroundColor Green
Write-Host ""

# Step 3: Update all import statements
Write-Host "Step 3: Updating import statements..." -ForegroundColor Yellow
$jsxFiles = Get-ChildItem -Path $srcFolder -Filter "*.jsx" -Recurse -File
$updatedImportsCount = 0

foreach ($file in $jsxFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Replace .tsx with .jsx in import/export statements
    $content = $content -replace '\.tsx', '.jsx'
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $updatedImportsCount++
        Write-Host "  Updated imports in: $($file.Name)" -ForegroundColor Gray
    }
}
Write-Host "Updated imports in $updatedImportsCount files" -ForegroundColor Green
Write-Host ""

# Step 4: Update index.html if it references .tsx
Write-Host "Step 4: Checking index.html..." -ForegroundColor Yellow
$indexHtmlPath = Join-Path $projectRoot "index.html"
if (Test-Path $indexHtmlPath) {
    $htmlContent = Get-Content -Path $indexHtmlPath -Raw -Encoding UTF8
    $originalHtmlContent = $htmlContent
    
    $htmlContent = $htmlContent -replace "src/index\.tsx", "src/index.jsx"
    $htmlContent = $htmlContent -replace "src/main\.tsx", "src/main.jsx"
    
    if ($htmlContent -ne $originalHtmlContent) {
        Set-Content -Path $indexHtmlPath -Value $htmlContent -Encoding UTF8 -NoNewline
        Write-Host "  Updated index.html" -ForegroundColor Green
    } else {
        Write-Host "  No changes needed in index.html" -ForegroundColor Gray
    }
}
Write-Host ""

# Step 5: Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Conversion Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - Files renamed: $renamedCount" -ForegroundColor White
Write-Host "  - Import statements updated: $updatedImportsCount" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Delete vite-env.d.ts file" -ForegroundColor White
Write-Host "  2. Update package.json scripts if needed" -ForegroundColor White
Write-Host "  3. Test the application: npm run dev" -ForegroundColor White
Write-Host ""
