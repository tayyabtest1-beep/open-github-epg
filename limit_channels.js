const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('sites/**/*.channels.xml');

let enCount = 0;
let ruCount = 0;
const EN_LIMIT = 1000;
const RU_LIMIT = 1000;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Split by <channel> tags
    const channelRegex = /<channel.*?lang="([^"]+)".*?<\/channel>/gs;
    
    let match;
    let newContent = content;
    
    // We will do a simple string replace for channels that exceed the limit
    let tagsToRemove = [];
    
    while ((match = channelRegex.exec(content)) !== null) {
        const fullTag = match[0];
        const lang = match[1];
        
        if (lang === 'en') {
            enCount++;
            if (enCount > EN_LIMIT) {
                tagsToRemove.push(fullTag);
                modified = true;
            }
        } else if (lang === 'ru') {
            ruCount++;
            if (ruCount > RU_LIMIT) {
                tagsToRemove.push(fullTag);
                modified = true;
            }
        }
    }
    
    if (modified) {
        for (const tag of tagsToRemove) {
            newContent = newContent.replace(tag + '\n', '');
            newContent = newContent.replace(tag + '\r\n', '');
            newContent = newContent.replace(tag, ''); // fallback
        }
        
        // If the file now has no <channel> tags left, we can just leave it empty or keep the <channels> shell
        fs.writeFileSync(file, newContent, 'utf8');
    }
}
console.log(`Limited en channels to ${Math.min(enCount, EN_LIMIT)} (originally ${enCount})`);
console.log(`Limited ru channels to ${Math.min(ruCount, RU_LIMIT)} (originally ${ruCount})`);
