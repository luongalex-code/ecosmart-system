# Compile all guarded driver/network branches in a separate directory; never flash.
$ErrorActionPreference = 'Stop'
$firmwareRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
. (Join-Path $firmwareRoot 'esp-idf.ps1')
$checkBuild = Join-Path $firmwareRoot 'build-hardware-check'
$checkConfig = Join-Path $checkBuild 'sdkconfig'
$defaults = Join-Path $PSScriptRoot 'hardware-compile.defaults'
idf.py -C $firmwareRoot -B $checkBuild -D "SDKCONFIG=$checkConfig" -D "SDKCONFIG_DEFAULTS=$defaults" build
exit $LASTEXITCODE
