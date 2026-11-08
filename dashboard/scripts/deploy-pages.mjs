// Publishes dashboard/dist to the gh-pages branch of the repo's origin (GitHub Pages).
// Usage (from dashboard/): npm run deploy
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });
const dist = path.resolve('dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('dist/ missing - run npm run build first');

const remote = execSync('git remote get-url origin').toString().trim();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ghpages-'));
fs.cpSync(dist, tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, '.nojekyll'), '');

run('git init -q -b gh-pages', tmp);
run('git add -A', tmp);
run('git -c user.name=deploy -c user.email=deploy@users.noreply.github.com commit -q -m "Deploy dashboard to GitHub Pages"', tmp);
run(`git push -q --force ${remote} gh-pages`, tmp);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('Deployed to gh-pages.');
