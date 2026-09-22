$yamlPath = ".github\workflows\epg-sync.yml"
$yaml = Get-Content $yamlPath -Raw

$yaml = $yaml -replace "language: \['es'", "language: ['en', 'ru', 'es'"
$yaml = $yaml -replace "--maxConnections 20 --days 1", "--maxConnections 20 --days 1 --timeout 3000"

Set-Content $yamlPath $yaml
