const fs = require('fs');
const path = require('path');

function getChannelFiles(dir = 'sites') {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { recursive: true });
  return entries
    .filter(f => typeof f === 'string' && f.endsWith('.channels.xml'))
    .map(f => path.join(dir, f));
}

const files = getChannelFiles('sites');

let enCount = 0;
let ruCount = 0;
const EN_LIMIT = 500;
const RU_LIMIT = 500;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let modified = false;

  const newContent = content.replace(/[ \t]*<channel\b[^>]*lang="([^"]+)"[^>]*>[\s\S]*?<\/channel>(\r?\n)?/g, (match, lang) => {
    if (lang === 'en') {
      enCount++;
      if (enCount > EN_LIMIT) {
        modified = true;
        return '';
      }
    } else if (lang === 'ru') {
      ruCount++;
      if (ruCount > RU_LIMIT) {
        modified = true;
        return '';
      }
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(file, newContent, 'utf8');
  }
}

console.log(`Limited en (USA/English) channels to ${Math.min(enCount, EN_LIMIT)} (originally ${enCount})`);
console.log(`Limited ru (Russia) channels to ${Math.min(ruCount, RU_LIMIT)} (originally ${ruCount})`);
