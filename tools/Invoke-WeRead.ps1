param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('/_list','/shelf/sync','/book/info','/book/getprogress','/book/chapterinfo','/user/notebooks','/book/bookmarklist','/review/list/mine','/readdata/detail','/book/recommend','/book/similar','/store/search')]
    [string]$ApiName,
    [hashtable]$Parameters = @{},
    [Parameter(Mandatory=$true)]
    [ValidatePattern('^[a-zA-Z0-9_-]+$')]
    [string]$SnapshotName
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$privatePath = Join-Path $root '.private'
$keyPath = Join-Path $privatePath 'weread-key.dpapi'
if (!(Test-Path -LiteralPath $keyPath)) { throw 'Missing local encrypted API key.' }
$skill = Get-Content -Raw -LiteralPath (Join-Path $root 'vendor/WeChatReading/skills/SKILL.md')
$version = [regex]::Match($skill, '(?m)^version:\s*([^\r\n]+)').Groups[1].Value.Trim()
if (!$version) { throw 'Missing official skill version.' }
$body = @{}
foreach ($p in $Parameters.Keys) {
    if ($p -in @('api_name','skill_version','params','body','data')) { throw 'Reserved or nested parameter.' }
    $body[$p] = $Parameters[$p]
}
$body.api_name = $ApiName
$body.skill_version = $version
$secret = (Get-Content -Raw -LiteralPath $keyPath).Trim() | ConvertTo-SecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try {
    $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    $headers = @{ Authorization = "Bearer $token" }
    try {
        $response = Invoke-RestMethod -Uri 'https://i.weread.qq.com/api/agent/gateway' -Method Post -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ($body | ConvertTo-Json -Depth 30 -Compress) -TimeoutSec 45 -MaximumRedirection 0
    } catch {
        throw 'Gateway request failed. No credentials or response content were printed.'
    }
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    $token = $null
    $headers = $null
    $secret.Dispose()
}
if ($response.upgrade_info -or $response.data.upgrade_info) { throw 'Official skill upgrade required; stop and review upgrade_info securely.' }
if (($null -ne $response.errcode -and $response.errcode -ne 0) -or ($null -ne $response.data.errcode -and $response.data.errcode -ne 0)) { throw 'Gateway returned an API error; snapshot not accepted.' }
$snapshot = [ordered]@{
    apiName = $ApiName
    parameters = $Parameters
    skillVersion = $version
    fetchedAt = [DateTimeOffset]::UtcNow.ToString('o')
    source = 'https://i.weread.qq.com/api/agent/gateway'
    response = $response
}
$destination = Join-Path $privatePath ($SnapshotName + '.json')
$snapshot | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $destination -Encoding UTF8
Write-Output ("Saved private snapshot: " + $SnapshotName)
