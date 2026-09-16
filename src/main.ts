import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// Il punto di ingresso dell'intera applicazione lato browser (teoria cap. 13/25).
// bootstrapApplication (approccio standalone): avvia direttamente il componente App
// con la sua configurazione, senza bisogno di un AppModule/platformBrowserDynamic
// come nell'Angular "classico".
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
