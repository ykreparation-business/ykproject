// Construit dist/index.html : un fichier unique (CSS + JS inline) publiable comme Artifact.
// Usage : npm install && npm run build
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const result = await build({
  entryPoints: ['src/ui/main.jsx'],
  bundle: true,
  write: false,
  format: 'iife',
  minify: true,
  target: ['es2020'],
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  loader: { '.js': 'jsx' },
  legalComments: 'none',
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = readFileSync('src/ui/styles.css', 'utf8');
const html = `<title>Global Recovery AI Titan</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Simulateur de gestion des créances et de recouvrement amiable — environnement de simulation, aucune opération réelle.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Sora:wght@500;600;700&display=swap">
<style>${css}</style>
<div id="titan-root"><div style="padding:40px 20px;text-align:center;font-family:system-ui;color:#7d8db0">Chargement de GLOBAL RECOVERY AI TITAN — environnement de simulation…</div></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>${js}</script>
`;
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
console.log(`dist/index.html — ${(html.length / 1024).toFixed(1)} Ko`);
