param(
    [ValidateSet('Environment', 'Version', 'SetTarget', 'Build')]
    [string]$Action = 'Environment'
)

# Dot-source this file to activate ESP-IDF in the current PowerShell terminal.
$env:IDF_PATH = 'C:\esp\v5.5.5\esp-idf'
$env:IDF_TOOLS_PATH = 'C:\Espressif'
$env:IDF_PYTHON_ENV_PATH = 'C:\Espressif\python_env\idf5.5_py3.11_env'
$idfPython = Join-Path $env:IDF_PYTHON_ENV_PATH 'Scripts'
if (-not (Test-Path -LiteralPath (Join-Path $idfPython 'python.exe'))) {
    throw "ESP-IDF Python environment not found: $idfPython"
}
if (-not (Test-Path -LiteralPath (Join-Path $env:IDF_PATH 'export.ps1'))) {
    throw "ESP-IDF framework not found: $env:IDF_PATH"
}
$env:PATH = "$idfPython;$env:PATH"
. (Join-Path $env:IDF_PATH 'export.ps1')
if (-not (Get-Command idf.py -ErrorAction SilentlyContinue)) {
    throw 'ESP-IDF activation failed: idf.py is unavailable.'
}

switch ($Action) {
    'Version'   { idf.py --version; exit $LASTEXITCODE }
    'SetTarget' { idf.py -C $PSScriptRoot set-target esp32; exit $LASTEXITCODE }
    'Build'     { idf.py -C $PSScriptRoot build; exit $LASTEXITCODE }
}
