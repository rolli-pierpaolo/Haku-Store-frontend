import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth-interceptor';

// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// Configurazione dell'app in stile standalone (teoria cap. 25): non esiste piu'
// un AppModule con "providers: [...]" dentro un NgModule, i provider globali
// (router, HttpClient, ecc.) si dichiarano qui e vengono passati a bootstrapApplication
// in main.ts.
export const appConfig: ApplicationConfig = {
  providers: [
    // withInterceptors([authInterceptor]) (teoria cap. 23): registra l'interceptor
    // JWT UNA SOLA VOLTA per tutta l'app, invece di doverlo aggiungere manualmente
    // ad ogni singola chiamata HTTP nei vari service
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    // provideRouter(routes) (teoria cap. 21): registra tutte le rotte definite in app.routes.ts
    provideRouter(routes), provideClientHydration()
  ]
};
