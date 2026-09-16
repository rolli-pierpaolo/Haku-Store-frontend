import { RenderMode, ServerRoute } from '@angular/ssr';

// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// L'autenticazione si basa su localStorage (esiste solo nel browser) e il catalogo/gli
// ordini sono dati dinamici: niente si presta al prerendering statico, quindi tutta
// l'app usa il rendering lato client (nessuna SSR reale, solo lo scheletro iniziale).
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
