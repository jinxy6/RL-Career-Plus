param(
  [string]$OutExe = (Join-Path $PSScriptRoot 'RL Career Hub - Career+.exe'),
  [string]$BakkesSdk = (Join-Path $env:APPDATA 'bakkesmod\bakkesmod\bakkesmodsdk')
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

# 1. Build rlcareerplus.dll (optional skip if already present and MSVC unavailable)
$vsDev = @(
  'C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat',
  'C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat',
  'C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvars64.bat',
  'C:\Program Files\Microsoft Visual Studio\2022\Enterprise\VC\Auxiliary\Build\vcvars64.bat'
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($vsDev -and (Test-Path (Join-Path $BakkesSdk 'lib\pluginsdk.lib'))) {
  Write-Host '[1/3] Compiling rlcareerplus.dll...'
  cmd /c "`"$vsDev`" >nul && cl.exe /nologo /O2 /MD /LD /EHsc /std:c++20 /I `"$BakkesSdk\include`" `"$root\rlcareerplus.cpp`" /Fe:`"$root\rlcareerplus.dll`" /Fo:`"$env:TEMP\rlcareerplus.obj`" /link /LIBPATH:`"$BakkesSdk\lib`" pluginsdk.lib"
  if ($LASTEXITCODE -ne 0) { throw 'cl.exe failed' }
  Remove-Item "$root\rlcareerplus.lib","$root\rlcareerplus.exp" -Force -ErrorAction SilentlyContinue
} elseif (-not (Test-Path "$root\rlcareerplus.dll")) {
  throw 'MSVC x64 Build Tools and BakkesMod SDK are required to compile rlcareerplus.dll.'
} else {
  Write-Host '[1/3] Using existing rlcareerplus.dll.'
}

# 2. Validate JS & run unit tests
Write-Host '[2/3] Validating JS & running self-checks...'
foreach ($f in @('launcher.js','inproc.js','ui.js')) {
  node --check (Join-Path $root $f)
  if ($LASTEXITCODE -ne 0) { throw "Syntax error in $f" }
}
node (Join-Path $root 'test_addon.js')
if ($LASTEXITCODE -ne 0) { throw 'test_addon.js failed' }

# 3. Compile standalone RL Career Hub - Career+.exe
Write-Host '[3/3] Building standalone executable...'
$csc = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path $csc)) { throw "csc.exe not found at $csc" }

$arenas = Get-ChildItem $root -Filter 'arena_*.jpg' | Sort-Object Name | Select-Object -ExpandProperty Name
$core = @('inproc.js','ui.js','launcher.js','rlcareerplus.dll','bg_vitality.jpg','bg_falcons.jpg','bg_kc.jpg','bg_cars.jpg')
if (Test-Path (Join-Path $root 'intro.webm')) { $core += 'intro.webm' }
$res = $core + $arenas
$resArgs = $res | ForEach-Object { "/resource:$root\$_,$_" }

& $csc /nologo /target:winexe /optimize+ "/win32icon:$root\icon.ico" "/win32manifest:$root\app.manifest" "/out:$OutExe" /r:System.Windows.Forms.dll /r:System.Drawing.dll @resArgs "$root\stub.cs"
if ($LASTEXITCODE -ne 0) { throw 'csc.exe failed' }

Get-Item $OutExe | Select-Object Name,Length,LastWriteTime
Write-Host '[DONE] Build complete.'
