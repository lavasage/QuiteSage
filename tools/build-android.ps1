$ErrorActionPreference='Stop'
$root=if($PSScriptRoot){Split-Path -Parent $PSScriptRoot}else{(Get-Location).Path}
Set-Location -LiteralPath $root
$sdk='C:\Users\lcc30\AppData\Local\Android\Sdk'
$build=Join-Path $sdk 'build-tools\36.1.0'
$jdk='D:\新建文件夹 (2)\jbr\bin'
$jar=Join-Path $sdk 'platforms\android-35\android.jar'
$out=Join-Path $root 'android\build'
New-Item -ItemType Directory -Force -Path $out,(Join-Path $out 'classes'),(Join-Path $out 'dex'),(Join-Path $out 'assets') | Out-Null
foreach($name in @('index.html','app.js','notes.js','style.css')){Copy-Item -LiteralPath (Join-Path $root ('prototype\'+$name)) -Destination (Join-Path $out 'assets') -Force}
Copy-Item -LiteralPath 'prototype/assets' -Destination (Join-Path $out 'assets') -Recurse -Force
& node 'tools/prepare-excerpts.cjs'
if($LASTEXITCODE -ne 0){throw 'Unable to prepare real excerpts.'}
Copy-Item -LiteralPath '.private/excerpts.json' -Destination (Join-Path $out 'assets/excerpts.json') -Force
function Check {if($LASTEXITCODE -ne 0){throw ('Android build command failed: '+$LASTEXITCODE)}}
& (Join-Path $build 'aapt.exe') package -f -M 'android/AndroidManifest.xml' -I $jar -A (Join-Path $out 'assets') -F (Join-Path $out 'unsigned.apk'); Check
$javaFiles=@(Get-ChildItem -LiteralPath 'android/src' -Filter '*.java' -Recurse | Select-Object -ExpandProperty FullName)
& (Join-Path $jdk 'javac.exe') -encoding UTF-8 -source 8 -target 8 -classpath $jar -d (Join-Path $out 'classes') $javaFiles; Check
$classFiles=@(Get-ChildItem -LiteralPath (Join-Path $out 'classes') -Filter '*.class' -Recurse | Select-Object -ExpandProperty FullName)
& (Join-Path $jdk 'java.exe') -cp (Join-Path $build 'lib\d8.jar') com.android.tools.r8.D8 --min-api 21 --lib $jar --output (Join-Path $out 'dex') $classFiles; Check
Push-Location (Join-Path $out 'dex')
try{& (Join-Path $jdk 'jar.exe') uf (Join-Path $out 'unsigned.apk') 'classes.dex'; Check}finally{Pop-Location}
& (Join-Path $build 'zipalign.exe') -f 4 (Join-Path $out 'unsigned.apk') (Join-Path $out 'aligned.apk'); Check
$key=Join-Path $root '.private\sage-development.jks'
if(!(Test-Path -LiteralPath $key)){& (Join-Path $jdk 'keytool.exe') -genkeypair -keystore $key -storepass android -keypass android -alias sage -dname 'CN=Sage Paper OS Development' -keyalg RSA -keysize 2048 -validity 10000 -startdate '2020/01/01 00:00:00'; Check}
& (Join-Path $jdk 'java.exe') -jar (Join-Path $build 'lib\apksigner.jar') sign --ks $key --ks-key-alias sage --ks-pass pass:android --key-pass pass:android --out (Join-Path $out 'QuiteSage.apk') (Join-Path $out 'aligned.apk'); Check
& (Join-Path $jdk 'java.exe') -jar (Join-Path $build 'lib\apksigner.jar') verify --verbose (Join-Path $out 'QuiteSage.apk'); Check
Write-Output 'Built android/build/QuiteSage.apk (private development build; selected real excerpts embedded, no account credentials).'
