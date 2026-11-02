param([string]$AndroidSdk='',[string]$JdkBin='')
$ErrorActionPreference='Stop'
$project=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $project
if($AndroidSdk){$env:ANDROID_SDK=$AndroidSdk.Replace('\','/')}
if($JdkBin){$env:JDK_BIN=$JdkBin.Replace('\','/')}
$bash=Get-Command bash -ErrorAction SilentlyContinue
if($bash){$executable=$bash.Source}else{$executable='C:\Program Files\Git\bin\bash.exe'}
if(!(Test-Path -LiteralPath $executable)){throw 'Install Git Bash, or run tools/build-android.sh with bash.'}
& $executable tools/build-android.sh
if($LASTEXITCODE -ne 0){throw 'Android build failed.'}
