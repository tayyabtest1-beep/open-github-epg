$filePath = "sites\tv.mail.ru\tv.mail.ru.config.js"
$content = Get-Content $filePath -Raw

$newCode = @"
        if (typeof res === 'string' || Buffer.isBuffer(res)) {
          try {
            res = JSON.parse(res)
          } catch (e) {
            console.error('Failed to parse JSON from tv.mail.ru:', e.message);
            res = {};
          }
        }
"@

$content = $content -replace "(?s)if \(typeof res === 'string' \|\| Buffer.isBuffer\(res\)\) \{\s*res = JSON.parse\(res\)\s*\}", $newCode

Set-Content $filePath $content
