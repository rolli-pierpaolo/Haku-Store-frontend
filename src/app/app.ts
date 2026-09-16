import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthServices } from './auth/auth-services';
import { CarrelloServices } from './services/carrello-services';

// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// Il componente RADICE dell'applicazione (teoria cap. 13): tutto il resto vive dentro
// il suo template, nel punto dove c'e' <router-outlet> (vedi app.html). E' l'equivalente
// di app.component.ts nella struttura "classica" descritta in teoria.
@Component({
  selector: 'app-root',
  // RouterOutlet/RouterLink/RouterLinkActive (teoria cap. 21): servono per il routing
  // e per evidenziare il link della pagina attiva nella navbar
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  // Iniettati qui (nel componente radice) perche' la navbar in app.html ha bisogno
  // di sapere se l'utente e' loggato/admin e quanti articoli ha nel carrello, sempre,
  // su ogni pagina dell'app
  auth = inject(AuthServices);
  carrelloS = inject(CarrelloServices);
  private router = inject(Router);

  annoCorrente = new Date().getFullYear();

  ngOnInit(): void {
    // Se l'utente arriva gia' loggato (sessione salvata in localStorage, vedi AuthServices),
    // precarica subito il carrello cosi' il badge nella navbar e' corretto fin da subito
    if (this.auth.isLogged()) this.carrelloS.ricarica();
  }

  logout(): void {
    this.auth.logout();
    this.carrelloS.carrello.set(null);
    this.router.navigate(['/login']);
  }
}
