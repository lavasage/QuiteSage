#!/usr/bin/env bash
# 手工构建 QuiteSage（PowerShell ExecutionPolicy 会拦住 .ps1，故保留 bash 版）
# 注意：工程目录含中文，aapt/javac 等 Windows 原生工具按 ANSI 解析参数会乱码，
# 所以所有原生工具都 cd 到 android/build 后用相对 ASCII 路径调用。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
SDK="${ANDROID_SDK:-${ANDROID_HOME:-${LOCALAPPDATA:-}/Android/Sdk}}"
SDK="${SDK//\\//}"
BT="$SDK/build-tools/36.1.0"
JAR="$SDK/platforms/android-35/android.jar"
JDK="${JDK_BIN:-${JAVA_HOME:+$JAVA_HOME/bin}}"
if [ -z "$JDK" ]; then echo "Set JDK_BIN (JDK bin directory) or JAVA_HOME" >&2; exit 1; fi
JDK="${JDK//\\//}"
OUT="$ROOT/android/build"

mkdir -p "$OUT/classes" "$OUT/dex" "$ROOT/.private"
ASSET_DIR="$(node tools/stage-public-assets.cjs)"
if [ ! -f .private/sage-development.jks ]; then
  "$JDK/keytool.exe" -genkeypair -keystore .private/sage-development.jks -storepass android -keypass android -alias sage -dname 'CN=QuiteSage Development' -keyalg RSA -keysize 2048 -validity 10000
fi
cp .private/sage-development.jks "$OUT/sage.jks"

cd "$OUT"
find ../../android/src -name '*.java' > src.txt

"$BT/aapt.exe" package -f -M ../../android/AndroidManifest.xml -S ../../android/res -I "$JAR" -A "$ASSET_DIR" -F unsigned.apk

"$JDK/javac.exe" -encoding UTF-8 -source 8 -target 8 -classpath "$JAR" -d classes @src.txt

find classes -name '*.class' > classes.txt
"$JDK/java.exe" -cp "$BT/lib/d8.jar" com.android.tools.r8.D8 --min-api 21 --lib "$JAR" --output dex @classes.txt

(cd dex && "$JDK/jar.exe" uf ../unsigned.apk classes.dex)
"$BT/zipalign.exe" -f 4 unsigned.apk aligned.apk
"$JDK/java.exe" -jar "$BT/lib/apksigner.jar" sign --ks sage.jks --ks-key-alias sage --ks-pass pass:android --key-pass pass:android --out QuiteSage.apk aligned.apk
"$JDK/java.exe" -jar "$BT/lib/apksigner.jar" verify QuiteSage.apk
echo "OK android/build/QuiteSage.apk (public-safe: no account data)"
