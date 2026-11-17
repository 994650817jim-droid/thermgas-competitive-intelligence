// Converts saved HTML pages to plain text next to the originals: node scripts/tools/html2txt.js a.html b.html
const fs = require('fs');
for (const f of process.argv.slice(2)) {
  let h = fs.readFileSync(f, 'utf8');
  h = h.replace(/<(script|style|noscript|svg|nav|header|footer)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d|td|th)>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;|&ndash;/g, '-').replace(/&#8217;|&rsquo;/g, "'").replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n');
  fs.writeFileSync(f.replace(/\.html?$/, '.txt'), h.trim());
}
