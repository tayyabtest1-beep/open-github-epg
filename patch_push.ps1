function Fix-Push {
    param($filePath)
    $content = Get-Content $filePath -Raw

    # Replace channels.push(...)
    $content = $content -replace 'if \(channelMatches\) channels\.push\(\.\.\.channelMatches\);', 'if (channelMatches) { for (let i = 0; i < channelMatches.length; i++) channels.push(channelMatches[i]); }'
    
    # Replace programmes.push(...)
    $content = $content -replace 'if \(progMatches\) programmes\.push\(\.\.\.progMatches\);', 'if (progMatches) { for (let i = 0; i < progMatches.length; i++) programmes.push(progMatches[i]); }'
    
    # Replace programmes.push(...prMatch) in epg-test.yml
    $content = $content -replace 'programmes\.push\(\.\.\.prMatch\);', 'for (let i = 0; i < prMatch.length; i++) programmes.push(prMatch[i]);'

    Set-Content $filePath $content
}

Fix-Push ".github\workflows\epg-sync.yml"
Fix-Push ".github\workflows\epg-test.yml"
