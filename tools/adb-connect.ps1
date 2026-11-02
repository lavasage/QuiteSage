param(
  [int]$WaitSec = 120,
  [string]$Serial = '',
  [string]$AdbPath = ''
)
# Only configure the selected reader. No Windows device/driver changes or root.
$ErrorActionPreference = 'Stop'
if ($WaitSec -lt 1 -or $WaitSec -gt 600) { throw 'WaitSec must be 1..600.' }
if (-not $AdbPath) {
  $resolved = Get-Command adb -ErrorAction SilentlyContinue
  if ($resolved) { $AdbPath = $resolved.Source }
  else { $AdbPath = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe' }
}
if (-not (Test-Path -LiteralPath $AdbPath)) { throw 'ADB not found; pass -AdbPath.' }
& $AdbPath start-server
if ($LASTEXITCODE -ne 0) { throw 'ADB server failed to start.' }
function Get-ReadyDevice {
  $rows = @(& $AdbPath devices | Select-Object -Skip 1 | Where-Object { $_ -match '^\S+\s+device\s*$' })
  $ids = @($rows | ForEach-Object { ($_ -split '\s+')[0] })
  if ($Serial) { if ($ids -contains $Serial) { return $Serial }; return '' }
  if ($ids.Count -gt 1) { throw 'Multiple devices connected; pass -Serial.' }
  if ($ids.Count -eq 1) { return $ids[0] }; return ''
}
$deadline = (Get-Date).AddSeconds($WaitSec)
$target = ''
do {
  $target = Get-ReadyDevice
  if ($target) { break }
  Start-Sleep -Milliseconds 1000
} while ((Get-Date) -lt $deadline)
if (-not $target) { throw 'No authorized ADB reader found. Check USB debugging on the reader.' }
# This can re-enumerate USB. It does not persist unsupported settings via root.
& $AdbPath -s $target shell svc usb setFunctions adb
if ($LASTEXITCODE -ne 0) { throw 'Reader rejected the USB function change.' }
Start-Sleep -Seconds 2
$config = (& $AdbPath -s $target shell getprop sys.usb.config) -join ''
$state = (& $AdbPath -s $target shell getprop sys.usb.state) -join ''
if ($config.Trim() -ne 'adb' -or $state.Trim() -ne 'adb') { throw 'Pure ADB not yet verified; reconnect and rerun.' }
Write-Output ('Verified pure ADB: '+$target)
