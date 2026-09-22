$filePath = ".github\workflows\epg-sync.yml"
$content = Get-Content $filePath -Raw
$content = $content -replace "\['en', 'ru', ", "["
Set-Content $filePath $content
