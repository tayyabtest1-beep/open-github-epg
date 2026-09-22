$yamlPath = ".github\workflows\epg-sync.yml"
$yaml = Get-Content $yamlPath -Raw

$newSteps = @"
      - name: Download all chunks
        uses: actions/download-artifact@v4
        with:
          path: chunks

      - name: Fetch massive regions instantly from upstream (en, ru)
        run: |
          mkdir -p chunks/upstream
          curl -s -L https://iptv-org.github.io/epg/guides/ru/guide.xml -o chunks/upstream/guide-ru.xml
          curl -s -L https://iptv-org.github.io/epg/guides/en/guide.xml -o chunks/upstream/guide-en.xml

      - name: Setup Node.js
"@

$yaml = $yaml -replace "(?s)      - name: Download all chunks\s+uses: actions/download-artifact@v4\s+with:\s+path: chunks\s+      - name: Setup Node.js", $newSteps

Set-Content $yamlPath $yaml
