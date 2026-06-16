import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8000';

const pages = [
  { name: 'Accueil', path: '/index.html', captureId: 'b525dcb9-25df-4f6e-9f29-0442d38cdb18' },
  { name: 'Gîtes / tarifs', path: '/gites.html', captureId: 'e6fcf28c-788f-4991-8770-01873246755a' },
  { name: 'Gîte Valeur Sûre', path: '/gite-valeur-sure.html', captureId: '2f96771f-fe11-497a-b379-342301cc3022' },
  { name: 'Gîte Coup de Cœur', path: '/gite-coup-de-coeur.html', captureId: '9b5e8944-547c-49e1-910b-8f4ecd00184e' },
  { name: 'Gîte Cocon Confort', path: '/gite-cocon-confort.html', captureId: '9958a48a-0479-4383-b874-82997ace8afc' },
  { name: 'Gîte Câlin', path: '/gite-calin.html', captureId: 'b874f864-a8a8-428b-8f96-2ee5ca7ce93e' },
  { name: "Gîte Chal'heureux", path: '/gite-chal-heureux.html', captureId: 'b19e7b65-7a72-4072-b564-077df15c6cfe' },
  { name: 'Gîte Nid Douillet', path: '/gite-nid-douillet.html', captureId: '7af09ad1-1183-498f-a3f4-884fc7829869' },
  { name: 'Les activités', path: '/activites.html', captureId: 'aee4c804-cd87-4d8e-90cc-e7c96dade0a8' },
  { name: 'Contact', path: '/contact.html', captureId: '93c827c0-0d11-4209-9307-15cfdee3875d' },
];

function captureUrl(path, captureId) {
  const endpoint = encodeURIComponent(`https://mcp.figma.com/mcp/capture/${captureId}/submit`);
  return `${BASE}${path}#figmacapture=${captureId}&figmaendpoint=${endpoint}&figmadelay=2500`;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const p of pages) {
  const page = await context.newPage();
  const url = captureUrl(p.path, p.captureId);
  console.log(`→ ${p.name}`);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    const waitMs = p.path.includes('index') ? 35000 : 25000;
    await page.waitForTimeout(waitMs);
    console.log(`✓ ${p.name}`);
  } catch (err) {
    console.error(`✗ ${p.name}:`, err.message);
  }
  await page.close();
}

await browser.close();
console.log('Captures terminées.');
