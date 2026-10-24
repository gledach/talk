# Read-only TCP snapshot. Ships with the repo. Writes one JSON array to stdout.
# Never closes a socket or a process.
# Windows PowerShell 5.1 writes a pipe as UTF-16 unless told otherwise.
try {
  $utf8 = New-Object System.Text.UTF8Encoding $false
  $OutputEncoding = $utf8
  [Console]::OutputEncoding = $utf8
} catch {}
$ErrorActionPreference = 'SilentlyContinue'
$procs = @{}
Get-CimInstance Win32_Process | ForEach-Object { $procs[[int]$_.ProcessId] = $_ }
$conns = @(Get-NetTCPConnection -ErrorAction SilentlyContinue)

function Ancestors([int]$start) {
  $list = @()
  $cur = $start
  $guard = 0
  $seen = @{}
  while ($cur -and $guard -lt 8 -and -not $seen.ContainsKey($cur)) {
    $seen[$cur] = $true
    $p = $procs[$cur]
    if (-not $p) { break }
    $list += [pscustomobject]@{
      pid = $cur
      name = [string]$p.Name
      commandLine = (([string]$p.CommandLine) -replace "`r|`n", ' ')
    }
    $cur = [int]$p.ParentProcessId
    $guard++
  }
  return $list
}

$rows = foreach ($g in ($conns | Group-Object OwningProcess)) {
  $pidNum = [int]$g.Name
  $proc = $procs[$pidNum]
  $alive = $null -ne $proc
  $chain = @()
  if ($alive) { $chain = @(Ancestors $pidNum) }
  $states = @{}
  foreach ($s in ($g.Group | Group-Object State)) { $states[$s.Name] = $s.Count }
  $ips = @($g.Group | Where-Object {
      $_.RemotePort -eq 443 -and $_.RemoteAddress -and $_.RemoteAddress -notin @('0.0.0.0', '::', '*')
    } | Select-Object -ExpandProperty RemoteAddress -Unique)
  [pscustomobject]@{
    pid = $pidNum
    alive = $alive
    total = $g.Count
    states = $states
    public443 = @($ips)
    ancestors = @($chain)
  }
}

Write-Output 'TALK_JSON_START'
if (-not $rows) { '[]' } else { @($rows) | ConvertTo-Json -Depth 6 -Compress }
Write-Output 'TALK_JSON_END'
