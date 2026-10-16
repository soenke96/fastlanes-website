// Nach dem Build: Unterseiten von dist/<seite>/index.html nach dist/<seite>.html verschieben.
// Grund: Cloudflare Pages liefert <seite>.html unter /<seite> aus (ohne Schrägstrich, wie bei Webflow),
// <seite>/index.html dagegen unter /<seite>/. Der Worker (html_handling: drop-trailing-slash) kommt mit beidem klar.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(import.meta.dirname, '..', 'dist');
let moved = 0;

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const sub = path.join(dir, entry.name);
    walk(sub);
    const index = path.join(sub, 'index.html');
    if (!fs.existsSync(index)) continue;
    const target = sub + '.html';
    if (fs.existsSync(target)) throw new Error('Gibt es schon: ' + target);
    fs.renameSync(index, target);
    if (fs.readdirSync(sub).length === 0) fs.rmdirSync(sub);
    moved++;
  }
};

walk(dist);
console.log(`flatten-html: ${moved} Seiten als <seite>.html abgelegt`);
