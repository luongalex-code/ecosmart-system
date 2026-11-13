$ErrorActionPreference = 'Stop'
$compiler = Get-Command gcc -ErrorAction SilentlyContinue
$compilerPath = if ($compiler) { $compiler.Source } else { 'C:\Program Files\CodeBlocks\MinGW\bin\gcc.exe' }
if (-not (Test-Path -LiteralPath $compilerPath)) { throw 'Install a host C compiler or put gcc in PATH.' }
$env:PATH = (Split-Path -Parent $compilerPath) + ';' + $env:PATH
$idf = if ($env:IDF_PATH) { $env:IDF_PATH } else { 'C:\esp\v5.5.5\esp-idf' }
$main = Join-Path $PSScriptRoot '..\main'
$cjson = Join-Path $idf 'components\json\cJSON'
$binary = Join-Path $env:TEMP 'ecosmart-protocol-test.exe'
& $compilerPath -std=c11 -Wall -Wextra -Werror -I $main -I $cjson (Join-Path $PSScriptRoot 'protocol_test.c') (Join-Path $main 'protocol.c') (Join-Path $cjson 'cJSON.c') -lm -o $binary
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $binary
exit $LASTEXITCODE
