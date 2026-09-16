// ============================================================================
// PROPRIETARIO: Mattia — Catalogo (Categoria / Prodotto / VarianteProdotto)
// ============================================================================
// Lo schema non prevede un campo immagine per prodotto: disegniamo quindi una sagoma
// SVG coerente con il tipo di prodotto (barattolo, flacone, manubrio, capo di
// abbigliamento...) invece di una foto vera. La scelta di forma/colore e' deterministica
// (stesso nome+marca+categoria => stessa immagine sempre), cosi' il catalogo resta
// coerente ad ogni ricarica. La Categoria invece un'immagine ce l'ha (upload da
// Admin -> Categorie): quando presente, il bollino "H" viene omesso (haCategoriaImmagine)
// e il chiamante sovrappone la vera foto con un <img> HTML (vedi .badge-categoria nel
// template) — un SVG in <img src="data:..."> non puo' caricare immagini esterne al suo interno.

const PALETTE_CONTENITORE = ['#1B3350', '#8A6D1A', '#5B4632', '#3F5A46', '#6B3B3B', '#33506B'];
const ACCENTO = '#2EC4D6'; // ciano del logo (papillon/scritta), non piu' oro
const CREMA = '#FBF4E3';
const NAVY = '#1B3350';

function hashStringa(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function iniziali(nome: string): string {
  const parole = nome.trim().split(/\s+/).filter(Boolean);
  if (parole.length === 0) return '?';
  if (parole.length === 1) return parole[0].slice(0, 2).toUpperCase();
  return (parole[0][0] + parole[1][0]).toUpperCase();
}

type Forma = 'flacone' | 'barattolo' | 'manubrio' | 'maglia' | 'scatola';

function formaProdotto(nome: string, categoria: string): Forma {
  const n = nome.toLowerCase();
  const c = categoria.toLowerCase();

  if (n.includes('vitamin') || n.includes('omega') || n.includes('capsul')) return 'flacone';
  if (n.includes('protein') || n.includes('whey') || n.includes('creatin') || n.includes('gainer') || c.includes('integrator')) return 'barattolo';
  if (c.includes('abbiglia') || n.includes('maglia') || n.includes('shirt')) return 'maglia';
  if (c.includes('attrezz') || c.includes('palestra') || c.includes('gym') || n.includes('manubri') || n.includes('peso')) return 'manubrio';
  return 'scatola';
}

// piccolo marchio circolare in un angolo, come "bollino" di fabbrica. Quando la
// categoria del prodotto ha una foto propria, il bollino qui viene omesso del tutto:
// un <img> HTML vero viene sovrapposto sopra da fuori (vedi .badge-categoria nel
// template), perche' un SVG mostrato via <img src="data:..."> NON puo' caricare
// immagini esterne al suo interno (i browser lo bloccano per sicurezza: si vedrebbe
// solo l'icona di "immagine non trovata", non la foto vera).
function marchioSvg(nascondiMarchio: boolean): string {
  if (nascondiMarchio) return '';

  return `
    <g transform="translate(352,254)" opacity="0.9">
      <circle r="26" fill="${NAVY}" stroke="${ACCENTO}" stroke-width="3" />
      <text x="0" y="8" font-family="Barlow Condensed, sans-serif" font-size="24" font-weight="800"
            fill="${ACCENTO}" text-anchor="middle">H</text>
    </g>`;
}

function formaBarattolo(colore: string, testo: string): string {
  return `
    <rect x="140" y="118" width="120" height="130" rx="10" fill="${colore}" />
    <rect x="128" y="92" width="144" height="30" rx="8" fill="${ACCENTO}" />
    <rect x="150" y="168" width="100" height="46" rx="4" fill="${CREMA}" opacity="0.95" />
    <text x="200" y="198" font-family="Barlow Condensed, sans-serif" font-size="30" font-weight="800"
          fill="${NAVY}" text-anchor="middle">${testo}</text>`;
}

function formaFlacone(colore: string, testo: string): string {
  return `
    <rect x="162" y="100" width="76" height="150" rx="16" fill="${colore}" opacity="0.92" />
    <rect x="172" y="70" width="56" height="34" rx="6" fill="${ACCENTO}" />
    <rect x="174" y="150" width="52" height="60" rx="4" fill="${CREMA}" opacity="0.95" />
    <text x="200" y="187" font-family="Barlow Condensed, sans-serif" font-size="20" font-weight="800"
          fill="${NAVY}" text-anchor="middle">${testo}</text>`;
}

function formaManubrio(colore: string): string {
  return `
    <rect x="112" y="142" width="176" height="16" rx="8" fill="${colore}" />
    <rect x="64" y="104" width="30" height="92" rx="10" fill="${NAVY}" />
    <rect x="96" y="122" width="18" height="56" rx="6" fill="${colore}" />
    <rect x="306" y="104" width="30" height="92" rx="10" fill="${NAVY}" />
    <rect x="286" y="122" width="18" height="56" rx="6" fill="${colore}" />`;
}

function formaMaglia(colore: string, testo: string): string {
  return `
    <path d="M150 96 L170 78 L200 92 L230 78 L250 96 L272 118 L250 138 L238 128
             L238 224 L162 224 L162 128 L150 138 L128 118 Z" fill="${colore}" />
    <text x="200" y="185" font-family="Barlow Condensed, sans-serif" font-size="26" font-weight="800"
          fill="${CREMA}" text-anchor="middle">${testo}</text>`;
}

function formaScatola(colore: string, testo: string): string {
  return `
    <rect x="130" y="120" width="140" height="110" rx="6" fill="${colore}" />
    <rect x="130" y="120" width="140" height="26" fill="${ACCENTO}" opacity="0.85" />
    <rect x="192" y="120" width="16" height="110" fill="${ACCENTO}" opacity="0.85" />
    <text x="200" y="200" font-family="Barlow Condensed, sans-serif" font-size="24" font-weight="800"
          fill="${CREMA}" text-anchor="middle">${testo}</text>`;
}

export function generaImmagineProdotto(
  nome: string,
  marca: string,
  categoria = '',
  haCategoriaImmagine = false,
): string {
  const seme = hashStringa(`${marca}::${nome}::${categoria}`);
  const colore = PALETTE_CONTENITORE[seme % PALETTE_CONTENITORE.length];
  const testo = iniziali(nome);
  const forma = formaProdotto(nome, categoria);

  let disegno = '';
  switch (forma) {
    case 'barattolo': disegno = formaBarattolo(colore, testo); break;
    case 'flacone': disegno = formaFlacone(colore, testo); break;
    case 'manubrio': disegno = formaManubrio(colore); break;
    case 'maglia': disegno = formaMaglia(colore, testo); break;
    case 'scatola': disegno = formaScatola(colore, testo); break;
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="sfondo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${CREMA}" />
      <stop offset="100%" stop-color="#F0E4C8" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#sfondo)" />
  ${disegno}
  ${marchioSvg(haCategoriaImmagine)}
  <text x="200" y="272" font-family="Inter, sans-serif" font-size="14" font-weight="600"
        letter-spacing="3" fill="${NAVY}" text-anchor="middle" opacity="0.75">${marca.toUpperCase()}</text>
</svg>`.trim();

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
