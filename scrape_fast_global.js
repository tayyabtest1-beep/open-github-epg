const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CHUNKS_DIR = path.join(__dirname, 'local_chunks');
const OUTPUT_XML = path.join(__dirname, 'global-epg.xml');
const OUTPUT_GZ = path.join(__dirname, 'global-epg.xml.gz');
const IPTVAPP_DIR = path.resolve(__dirname, '../iptvapp');

// Verified, fast and responsive providers per language
const TARGETS = [
  { name: 'USA & English', lang: 'en', sites: 'ontvtonight.com,epgshare01.online,plex.tv,pluto.tv,tvtv.us' },
  { name: 'Russia', lang: 'ru', sites: 'epg.iptvx.one,tv.mail.ru,ctc.ru' },
  { name: 'Spanish (Spain & LatAm)', lang: 'es', sites: 'gatotv.com,movistarplus.es,mi.tv' },
  { name: 'French', lang: 'fr', sites: 'programme-tv.net,canalplus.com' },
  { name: 'German', lang: 'de', sites: 'web.magentatv.de,tvspielfilm.de' },
  { name: 'Arabic', lang: 'ar', sites: 'elcinema.com,sat.tv' },
  { name: 'Hindi & Urdu', lang: 'hi,ur', sites: 'tataplay.com,airtelxstream.in' },
  { name: 'Italian', lang: 'it', sites: 'superguidatv.it,guidatv.sky.it' },
  { name: 'Portuguese', lang: 'pt', sites: 'meo.pt,nostv.pt' },
  { name: 'Dutch', lang: 'nl', sites: 'tvgids.nl,webtv.delta.nl' },
  { name: 'Turkish', lang: 'tr', sites: 'tvplus.com.tr' },
  { name: 'Polish', lang: 'pl', sites: 'programtv.onet.pl' }
];

console.log('====================================================');
console.log('   🚀 FAST LOCAL GLOBAL EPG SCRAPER (VERIFIED SERVERS)');
console.log('====================================================\n');

if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR, { recursive: true });
}

const overallStart = Date.now();

TARGETS.forEach((target, index) => {
  const stepNum = index + 1;
  const chunkFile = path.join(CHUNKS_DIR, `guide-${target.lang.replace(/,/g, '_')}.xml`);
  const relativeChunk = path.relative(__dirname, chunkFile);

  console.log(`\n[${stepNum}/${TARGETS.length}] Grabbing: ${target.name} (lang: ${target.lang})...`);
  console.log(`     Target Sites: ${target.sites}`);

  const cmd = `npx tsx scripts/commands/epg/grab.ts --sites="${target.sites}" --lang="${target.lang}" --output="${relativeChunk}" --maxConnections=25 --days=3 --timeout=3000`;

  const start = Date.now();
  try {
    execSync(cmd, { stdio: 'inherit', cwd: __dirname });
    const dur = Math.round((Date.now() - start) / 1000);
    console.log(`  ✅ Finished ${target.name} in ${dur}s.`);
  } catch (err) {
    console.log(`  ⚠️ Warning: Finished with errors or partial data for ${target.name} (Continuing...)`);
  }
});

console.log('\n====================================================');
console.log('   🔄 MERGING ALL DOWNLOADED CHUNKS INTO MASTER EPG');
console.log('====================================================\n');

let uniqueChannels = [];
let seenIds = new Set();
let programmes = [];

const chunkFiles = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.xml'));

chunkFiles.forEach(file => {
  const fullPath = path.join(CHUNKS_DIR, file);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');

    // Extract channels
    const chMatches = content.match(/<channel[\s\S]*?<\/channel>/g) || [];
    chMatches.forEach(ch => {
      const idMatch = ch.match(/id="([^"]+)"/);
      if (idMatch && !seenIds.has(idMatch[1])) {
        seenIds.add(idMatch[1]);
        uniqueChannels.push(ch);
      }
    });

    // Extract programmes
    const prMatches = content.match(/<programme[\s\S]*?<\/programme>/g) || [];
    for (let i = 0; i < prMatches.length; i++) {
      programmes.push(prMatches[i]);
    }

    console.log(`  ✓ Included ${file}: ${chMatches.length} channels, ${prMatches.length} programs`);
  } catch (err) {
    console.log(`  ✗ Error reading chunk ${file}: ${err.message}`);
  }
});

const finalXml = `<?xml version="1.0" encoding="UTF-8"?>
<tv generator-info-name="AvelixTV-Global" generator-info-url="https://github.com/tayyabtest1-beep/open-github-epg">
  ${uniqueChannels.join('\n  ')}
  ${programmes.join('\n  ')}
</tv>`;

console.log(`\nWriting master XML: ${OUTPUT_XML}...`);
fs.writeFileSync(OUTPUT_XML, finalXml, 'utf8');
const xmlSizeMb = (fs.statSync(OUTPUT_XML).size / (1024 * 1024)).toFixed(2);
console.log(`  ✓ Created global-epg.xml (${xmlSizeMb} MB) with ${uniqueChannels.length} channels and ${programmes.length} programs.`);

console.log(`Compressing to GZIP: ${OUTPUT_GZ}...`);
const gzBuffer = zlib.gzipSync(Buffer.from(finalXml, 'utf8'), { level: 9 });
fs.writeFileSync(OUTPUT_GZ, gzBuffer);
const gzSizeMb = (gzBuffer.length / (1024 * 1024)).toFixed(2);
console.log(`  ✓ Created global-epg.xml.gz (${gzSizeMb} MB).`);

// If iptvapp exists in the parent workspace, copy it over automatically
if (fs.existsSync(IPTVAPP_DIR)) {
  const iptvPublic = path.join(IPTVAPP_DIR, 'public');
  const iptvEpgFiles = path.join(IPTVAPP_DIR, 'epg files');

  if (fs.existsSync(iptvPublic)) {
    fs.copyFileSync(OUTPUT_XML, path.join(iptvPublic, 'guide.xml'));
    fs.copyFileSync(OUTPUT_GZ, path.join(iptvPublic, 'guide.xml.gz'));
    console.log(`  ✓ Copied guide files to iptvapp/public/`);
  }
  if (fs.existsSync(iptvEpgFiles)) {
    fs.copyFileSync(OUTPUT_XML, path.join(iptvEpgFiles, 'matched_guide.xml'));
    console.log(`  ✓ Copied to iptvapp/epg files/matched_guide.xml`);
  }
}

const totalMins = ((Date.now() - overallStart) / 60000).toFixed(1);
console.log('\n====================================================');
console.log(`   🎉 ALL DONE in ${totalMins} minutes!`);
console.log(`   Master XML: ${OUTPUT_XML}`);
console.log(`   Master GZ : ${OUTPUT_GZ}`);
console.log('====================================================\n');
