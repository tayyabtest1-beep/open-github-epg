$workflow = Get-Content .github\workflows\epg-test.yml -Raw

$oldMerge = @"
      - name: Merge Chunks
        run: |
          mkdir -p output
          npx tsx scripts/commands/epg/merge.ts --input chunks/**/*.xml --output output/global-epg.xml
"@

$newMerge = @"
      - name: Merge Chunks
        run: |
          npm install glob
          cat << 'EOF' > merge.js
          const fs = require('fs');
          const glob = require('glob');
          
          const files = glob.sync('chunks/**/*.xml');
          let uniqueChannels = [];
          let seenIds = new Set();
          let programmes = [];
          
          files.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const chMatch = content.match(/<channel.*?>.*?<\/channel>/gs) || [];
            const prMatch = content.match(/<programme.*?>.*?<\/programme>/gs) || [];
            
            programmes.push(...prMatch);
            
            chMatch.forEach(ch => {
              const idMatch = ch.match(/id="([^"]+)"/);
              if (idMatch && !seenIds.has(idMatch[1])) {
                seenIds.add(idMatch[1]);
                uniqueChannels.push(ch);
              }
            });
          });
          
          const finalXml = `<?xml version="1.0" encoding="UTF-8"?>\n<tv generator-info-name="AvelixTV-Global" generator-info-url="https://github.com/tayyabtest1-beep/open-github-epg">\n  ${uniqueChannels.join('\n  ')}\n  ${programmes.join('\n  ')}\n</tv>`;
          
          mkdir -p output
          fs.writeFileSync('output/global-epg.xml', finalXml);
          console.log(`Merged ${uniqueChannels.length} channels and ${programmes.length} programs!`);
          EOF
          node merge.js
"@

$workflow = $workflow.Replace($oldMerge, $newMerge)
Set-Content .github\workflows\epg-test.yml $workflow
