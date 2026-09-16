import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthServices } from './auth-services';

// ============================================================================
// PROPRIETARIO: Sarah — Utente, Recensioni & Sicurezza
// ============================================================================
// Interceptor (teoria cap. 23 e 38-39): intercetta OGNI richiesta HTTP in uscita
// dall'app prima che parta davvero, e ci allega automaticamente il token JWT.
// Senza questo, ogni service (CarrelloServices, OrdineServices, ecc.) dovrebbe
// aggiungere manualmente l'header Authorization ad ogni singola chiamata: qui e'
// centralizzato in un solo punto, registrato una volta in app.config.ts.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthServices).getToken();

  // Nessun token (utente non loggato, o endpoint pubblico tipo /categoria/list):
  // la richiesta parte cosi' com'e', invariata
  if (!token) return next(req);

  // Le richieste HTTP di Angular sono IMMUTABILI: non si puo' modificare "req" direttamente,
  // va clonata con le modifiche desiderate (qui: aggiungere l'header Authorization)
  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
