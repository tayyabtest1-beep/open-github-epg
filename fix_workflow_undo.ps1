$yamlPath = ".github\workflows\epg-sync.yml"
$yaml = Get-Content $yamlPath -Raw

$yaml = $yaml -replace "(?s)      - name: Fetch massive regions instantly from upstream \(en, ru\).*?curl -s -L https://iptv-org.github.io/epg/guides/en/guide.xml -o chunks/upstream/guide-en.xml", ""

Set-Content $yamlPath $yaml
