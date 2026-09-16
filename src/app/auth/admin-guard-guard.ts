import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from './auth-services';
import { inject } from '@angular/core';

// ============================================================================
// PROPRIETARIO: Sarah — Utente, Recensioni & Sicurezza
// ============================================================================
// Guard "rinforzato": oltre a essere loggati (teoria cap. 21, come authGuardGuard),
// serve anche il ruolo ADMIN — equivalente lato frontend di @PreAuthorize("hasRole('ADMIN')")
// visto nel backend (teoria cap. 38). ATTENZIONE: questo protegge solo la NAVIGAZIONE
// (nasconde/blocca le pagine admin nell'interfaccia): la vera sicurezza resta comunque
// nel backend, che ricontrolla il ruolo su ogni endpoint indipendentemente da questo guard.
export const adminGuardGuard: CanActivateFn = (route, state) => {
  const authServices = inject(AuthServices);
  const router = inject(Router);

  if (authServices.isLogged() && authServices.isAdmin()) return true;

  // Se non e' admin (o non e' nemmeno loggato), rimanda semplicemente alla home,
  // senza returnUrl: non ha senso "tornare" a una pagina admin a cui non si ha accesso
  return router.createUrlTree(['/home']);
};
