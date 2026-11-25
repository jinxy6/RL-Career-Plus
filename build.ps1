param(
  [string]$OutExe = (Join-Path $PSScriptRoot 'RL Career Hub - Career+.exe'),
  [string]$BakkesSdk = (Join-Path $env:APPDATA 'bakkesmod\bakkesmod\bakkesmodsdk')
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$src = Join-Path $root 'src'
$assets = Join-Path $root 'assets'

# 1. Build rlcareerplus.dll (optional skip if already present and MSVC unavailable)
$vsDev = @(
  'C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat',
  'C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat',
  'C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvars64.bat',
  'C:\Program Files\Microsoft Visual Studio\2022\Enterprise\VC\Auxiliary\Build\vcvars64.bat'
) | Where-Object { Test-Path $_ } | Select-Object -First 1

$dllOut = Join-Path $root 'rlcareerplus.dll'
$crowdDllOut = Join-Path $root 'rlcareer_crowd.dll'
if ($vsDev -and (Test-Path (Join-Path $BakkesSdk 'lib\pluginsdk.lib'))) {
  Write-Host '[1/3] Compiling rlcareerplus.dll & rlcareer_crowd.dll...'
  cmd /c "`"$vsDev`" >nul && cl.exe /nologo /O2 /MD /LD /EHsc /std:c++20 /I `"$BakkesSdk\include`" `"$src\rlcareerplus.cpp`" /Fe:`"$dllOut`" /Fo:`"$env:TEMP\rlcareerplus.obj`" /link /LIBPATH:`"$BakkesSdk\lib`" pluginsdk.lib"
  if ($LASTEXITCODE -ne 0) { throw 'cl.exe failed (rlcareerplus.cpp)' }
  cmd /c "`"$vsDev`" >nul && cl.exe /nologo /O2 /MD /LD /EHsc /std:c++20 /I `"$BakkesSdk\include`" `"$src\rlcareer_crowd.cpp`" /Fe:`"$crowdDllOut`" /Fo:`"$env:TEMP\rlcareer_crowd.obj`" /link /LIBPATH:`"$BakkesSdk\lib`" pluginsdk.lib"
  if ($LASTEXITCODE -ne 0) { throw 'cl.exe failed (rlcareer_crowd.cpp)' }
  Remove-Item "$root\rlcareerplus.lib","$root\rlcareerplus.exp","$root\rlcareer_crowd.lib","$root\rlcareer_crowd.exp" -Force -ErrorAction SilentlyContinue
} elseif (-not (Test-Path $dllOut) -or -not (Test-Path $crowdDllOut)) {
  throw 'MSVC x64 Build Tools and BakkesMod SDK are required to compile BakkesMod plugins.'
} else {
  Write-Host '[1/3] Using existing BakkesMod DLLs.'
}

# 2. Validate JS & run unit tests
Write-Host '[2/3] Validating JS & running self-checks...'
foreach ($f in @('launcher.js','inproc.js','ui.js','staff-engine.js','staff-ui.js','y-engine.js','y-ui.js','crowd-engine.js','crowd-ui.js')) {
  node --check (Join-Path $src $f)
  if ($LASTEXITCODE -ne 0) { throw "Syntax error in $f" }
}
node (Join-Path $src 'test_addon.js')
if ($LASTEXITCODE -ne 0) { throw 'test_addon.js failed' }
node (Join-Path $src 'test_staff.js')
if ($LASTEXITCODE -ne 0) { throw 'test_staff.js failed' }

# 3. Compile standalone RL Career Hub - Career+.exe
Write-Host '[3/3] Building standalone executable...'
$csc = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path $csc)) { throw "csc.exe not found at $csc" }

$resArgs = @()
foreach ($f in @('inproc.js','ui.js','launcher.js','staff-engine.js','staff-ui.js','y-engine.js','y-ui.js','crowd-engine.js','crowd-ui.js')) {
  $resArgs += "/resource:$(Join-Path $src $f),$f"
}
$resArgs += "/resource:$dllOut,rlcareerplus.dll"
$resArgs += "/resource:$crowdDllOut,rlcareer_crowd.dll"
foreach ($f in @('bg_vitality.jpg','bg_falcons.jpg','bg_kc.jpg','bg_cars.jpg','crowd_pop_goal.mp3','crowd_pop_save.mp3')) {
  $resArgs += "/resource:$(Join-Path $assets $f),$f"
}
if (Test-Path (Join-Path $root 'intro.webm')) {
  $resArgs += "/resource:$(Join-Path $root 'intro.webm'),intro.webm"
} elseif (Test-Path (Join-Path $assets 'intro.webm')) {
  $resArgs += "/resource:$(Join-Path $assets 'intro.webm'),intro.webm"
}
$arenas = Get-ChildItem $assets -Filter 'arena_*.jpg' | Sort-Object Name
foreach ($a in $arenas) {
  $resArgs += "/resource:$($a.FullName),$($a.Name)"
}

& $csc /nologo /target:winexe /optimize+ "/win32icon:$(Join-Path $assets 'icon.ico')" "/win32manifest:$(Join-Path $src 'app.manifest')" "/out:$OutExe" /r:System.Windows.Forms.dll /r:System.Drawing.dll @resArgs (Join-Path $src 'stub.cs')
if ($LASTEXITCODE -ne 0) { throw 'csc.exe failed' }

Get-Item $OutExe | Select-Object Name,Length,LastWriteTime
Write-Host '[DONE] Build complete.'
