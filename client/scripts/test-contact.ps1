param(
  [string]$BaseUrl = $env:BASE_URL ?? $env:NEXT_PUBLIC_BASE_URL
)

if (-not $BaseUrl) {
  Write-Host "$([char]0x26A0) No BASE URL provided, defaulting to http://localhost:5000"
  $BaseUrl = 'http://localhost:5000'
}

# Build endpoint
$Endpoint = "$($BaseUrl.TrimEnd('/'))/api/contact"

Write-Host "Posting to: $Endpoint"

$body = @{
  nom = "PowerShell Tester"
  email = "test@local"
  sujet = "Test"
  message = "Hello from test-contact.ps1"
} | ConvertTo-Json

try {
  $resp = Invoke-RestMethod -Uri $Endpoint -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  Write-Host "Status: success (parsed body)"
  $resp | ConvertTo-Json -Depth 5 | Write-Host
} catch {
  Write-Host "Request failed:`n$($_.Exception.Message)"
  if ($_.Exception.Response) {
    try {
      $raw = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd()
      Write-Host "Raw response:`n$raw"
    } catch {
      # ignore
    }
  }
}
