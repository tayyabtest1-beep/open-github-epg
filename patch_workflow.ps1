$filePath = ".github\workflows\epg-sync.yml"
$content = Get-Content $filePath -Raw

$content = $content -replace "(?m)^  merge:\r?\n    needs: grab", "  merge:`n    needs: grab`n    if: always()"

Set-Content $filePath $content
