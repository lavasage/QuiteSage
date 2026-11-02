param([switch]$ForceRefresh)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root
$private = Join-Path $root '.private'
$shelf = (Get-Content -Raw (Join-Path $private 'shelf.json') | ConvertFrom-Json).response
$notebooks = (Get-Content -Raw (Join-Path $private 'notebooks-0.json') | ConvertFrom-Json).response
if ($notebooks.hasMore) { throw 'Notebook overview incomplete; paginate before detail collection.' }
$ids = @(@($shelf.books.bookId) + @($notebooks.books.bookId) | Sort-Object -Unique)
$results = [System.Collections.Generic.List[object]]::new()
function Fetch([string]$api, [hashtable]$parameters, [string]$name) {
    if (!$ForceRefresh -and (Test-Path -LiteralPath (Join-Path $private ($name+'.json')))) { return $true }
    try {
        & (Join-Path $PSScriptRoot 'Invoke-WeRead.ps1') -ApiName $api -Parameters $parameters -SnapshotName $name | Out-Null
        $results.Add(@{name=$name;status='available'})
        return $true
    } catch {
        $results.Add(@{name=$name;status='error';message=$_.Exception.Message})
        if ($_.Exception.Message -like '*upgrade*') { throw }
        return $false
    }
}
$index = 0
foreach ($id in $ids) {
    $index++
    $null = Fetch '/book/getprogress' @{bookId=$id} ('progress-'+$id)
    $null = Fetch '/book/info' @{bookId=$id} ('book-'+$id)
    $nb = $notebooks.books | Where-Object { $_.bookId -eq $id } | Select-Object -First 1
    if ($nb.noteCount -gt 0) { $null = Fetch '/book/bookmarklist' @{bookId=$id} ('highlights-'+$id) }
    if ($nb.reviewCount -gt 0) {
        $cursor = 0
        $seen = @{}
        do {
            $name = 'reviews-'+$id+'-'+$cursor
            if (!(Fetch '/review/list/mine' @{bookid=$id;synckey=$cursor;count=100} $name)) { break }
            $r = (Get-Content -Raw (Join-Path $private ($name+'.json')) | ConvertFrom-Json).response
            if (!$r.hasMore) { break }
            if ($null -eq $r.synckey -or $seen.ContainsKey([string]$r.synckey) -or $r.synckey -eq $cursor) {
                $results.Add(@{name=$name;status='partial';message='Pagination cursor stalled'})
                break
            }
            $cursor = $r.synckey
            $seen[[string]$cursor] = $true
        } while ($true)
    }
    if (($index % 10) -eq 0 -or $index -eq $ids.Count) { Write-Output ("Collected " + $index + '/' + $ids.Count + ' books') }
    $results | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $private 'collection-status.json') -Encoding UTF8
}
Write-Output 'Read-only detail collection finished.'
