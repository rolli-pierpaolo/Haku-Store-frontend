import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_BASE_URL } from '../core/api-config';
import { AuthResponseDTO, UtenteDTO } from '../models/models';

// ============================================================================
// PROPRIETARIO: Sarah — Utente, Recensioni & Sicurezza
// ============================================================================
// Il "cervello" dell'autenticazione lato frontend: gestisce login/register/logout,
// salva il JWT ricevuto dal backend e tiene lo stato reattivo di "chi e' loggato".
// E' l'equivalente pratico della teoria del capitolo 38 (JWT: header.payload.signature,
// flusso di login) applicata dal lato client invece che dal server.

const TOKEN_KEY = 'hakustore_token';
const TOKEN_EXP_KEY = 'hakustore_token_exp';
const USER_KEY = 'hakustore_user';

// @Injectable({ providedIn: 'root' }): questo service e' un SINGLETON in tutta l'app
// (teoria cap. 20 — Services e Dependency Injection). Angular ne crea una sola istanza
// e la inietta ovunque venga richiesta nel costruttore/inject() di altri componenti/service.
@Injectable({ providedIn: 'root' })
export class AuthServices {
  // inject(HttpClient) e' la forma "a funzione" della Dependency Injection (equivalente
  // a "constructor(private http: HttpClient) {}" visto in teoria, ma utilizzabile anche
  // fuori da un costruttore, es. nei guard/interceptor a funzione qui sotto)
  private http = inject(HttpClient);
  private url = API_BASE_URL + '/auth/';
  // in SSR (rendering lato server) non esiste il localStorage del browser:
  // tutte le letture/scritture vanno protette con questo controllo
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // signal (teoria cap. 26): un "contenitore" di stato reattivo. Si legge chiamandolo
  // come una funzione — currentUser() — e ogni componente che lo legge nel template
  // si aggiorna automaticamente da solo quando il valore cambia, senza bisogno di
  // ngOnChanges o di ricontrolli manuali.
  currentUser = signal<UtenteDTO | null>(this.leggiUtenteSalvato());
  // computed (teoria cap. 26): un signal "derivato" che si ricalcola da solo ogni volta
  // che i signal che legge al suo interno (currentUser, e indirettamente il token) cambiano
  isLogged = computed(() => this.currentUser() !== null && !this.tokenScaduto());
  isAdmin = computed(() => this.currentUser()?.ruolo === 'ADMIN');

  // this.http.post restituisce sempre un Observable (teoria cap. 23/24), mai il dato diretto:
  // chi chiama login() deve fare .subscribe() (o async pipe) per ottenere davvero la risposta
  login(email: string, password: string) {
    return this.http.post<AuthResponseDTO>(this.url + 'login', { email, password })
      // .pipe(tap(...)) (teoria cap. 24, operatori RxJS): tap esegue un effetto collaterale
      // (salvare il token) SENZA modificare il valore che scorre nell'Observable
      .pipe(tap((resp) => this.salvaSessione(resp)));
  }

  register(body: { nome: string; cognome: string; email: string; password: string; telefono?: string }) {
    return this.http.post<AuthResponseDTO>(this.url + 'register', body)
      .pipe(tap((resp) => this.salvaSessione(resp)));
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXP_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.currentUser.set(null);
  }

  // Letto da authInterceptor.ts ad ogni richiesta HTTP in uscita, per allegare
  // l'header Authorization: Bearer <token> (teoria cap. 38-39)
  getToken(): string | null {
    if (!this.isBrowser || this.tokenScaduto()) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  // Salva il token JWT, la sua scadenza e i dati utente ricevuti dal backend dopo
  // login/register — sul frontend il token e' un dato opaco: non viene mai decodificato
  // o validato qui, ci pensa solo il backend a verificarne la firma
  private salvaSessione(resp: AuthResponseDTO): void {
    if (this.isBrowser) {
      const scadenza = Date.now() + resp.expiresIn * 1000;
      localStorage.setItem(TOKEN_KEY, resp.token);
      localStorage.setItem(TOKEN_EXP_KEY, String(scadenza));
      localStorage.setItem(USER_KEY, JSON.stringify(resp.utente));
    }
    this.currentUser.set(resp.utente);
  }

  private tokenScaduto(): boolean {
    if (!this.isBrowser) return true;
    const scadenza = localStorage.getItem(TOKEN_EXP_KEY);
    if (!scadenza) return true;
    return Date.now() > Number(scadenza);
  }

  // Ripristina la sessione salvata quando l'app viene ricaricata (F5): senza questo,
  // ogni refresh della pagina disconnetterebbe l'utente anche se il token e' ancora valido
  private leggiUtenteSalvato(): UtenteDTO | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UtenteDTO;
    } catch {
      return null;
    }
  }
}
