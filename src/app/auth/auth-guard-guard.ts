import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from './auth-services';
import { inject } from '@angular/core';

// ============================================================================
// PROPRIETARIO: Sarah — Utente, Recensioni & Sicurezza
// ============================================================================
// Route guard (teoria cap. 21): una funzione che decide se permettere l'accesso a
// una rotta. CanActivateFn e' la forma moderna "a funzione" (senza classe) del guard.
// Applicata nelle rotte protette in app.routes.ts, es. { path: 'profilo', canActivate: [authGuardGuard] }
export const authGuardGuard: CanActivateFn = (route, state) => {
  const authservices = inject(AuthServices);
  const router = inject(Router);

  // isLogged e' un computed signal (vedi auth-services.ts): true solo se c'e' un
  // utente salvato E il token non e' scaduto
  if (authservices.isLogged()) return true;

  // Se non autenticato, invece di un semplice false, si restituisce un UrlTree verso
  // /login — cosi' l'utente viene rimandato al login invece di vedere una pagina bianca,
  // e returnUrl permette di tornare alla pagina originale dopo aver fatto login
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
