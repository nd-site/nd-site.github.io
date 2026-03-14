# Mau: .\push_secrets.ps1 nd-site/nd-site.github.io
# Cach dung: Go vao Terminal va su dung lenh: .\push_secrets.ps1 <owner>/<repo_name>

param (
    [Parameter(Mandatory = $true)]
    [string]$RepoName
)

# Kiem tra file .env
if (-not (Test-Path ".env")) {
    Write-Host "[-] Khong tim thay file .env tai thu muc goc!" -ForegroundColor Red
    exit
}

Write-Host "[>] Dang chuan bi day Secrets len repo: $RepoName" -ForegroundColor Cyan

# Doc file .env va day tung dong len GitHub
Get-Content .env | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $key = $line.Split("=")[0].Trim()
        $value = $line.Split("=")[1].Trim().Replace("'", "").Replace('"', '')
        
        Write-Host "  -> Dang thiet lap: $key..." -ForegroundColor Yellow
        
        # Tim duong dan gh
        $ghPath = "gh"
        if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
            if (Test-Path "C:\Program Files\GitHub CLI\gh.exe") {
                $ghPath = "& 'C:\Program Files\GitHub CLI\gh.exe'"
            }
        }

        # Su dung lenh GitHub CLI de thiet lap Secret
        Invoke-Expression "echo '$value' | $ghPath secret set $key --repo $RepoName"
    }
}

Write-Host "[+] Hoan tat! Tat ca API tu .env da duoc luu an toan tren GitHub cua repo $RepoName." -ForegroundColor Green
