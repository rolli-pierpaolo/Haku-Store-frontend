import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_BASE_URL } from '../core/api-config';
import { CarrelloDTO, ResponseDTO } from '../models/models';

// ============================================================================
// PROPRIETARIO: Pier — Carrello (Carrello / DettaglioCarrello / Coupon)
// ============================================================================
// Questo service parla con il backend per tutto cio' che riguarda il carrello:
// aggiungere/togliere prodotti, cambiare quantita', applicare un coupon.
@Injectable({ providedIn: 'root' })
export class CarrelloServices {
  private http = inject(HttpClient);
  private url = API_BASE_URL + '/carrello';

  // stato del carrello condiviso da tutta l'app (es. contatore nella navbar). Signal
  // (teoria cap. 26): qualunque componente lo legga si aggiorna da solo quando cambia,
  // senza bisogno di passare il dato manualmente tramite @Input da un componente all'altro
  carrello = signal<CarrelloDTO | null>(null);

  // Funzione derivata (equivalente semplificato di un computed, teoria cap. 26): somma
  // le quantita' di tutte le righe, utile per il badge "3" sull'icona carrello nella navbar
  numeroArticoli = () =>
    this.carrello()?.righe.reduce((tot, r) => tot + r.quantita, 0) ?? 0;

  // Ricarica il carrello dal backend e aggiorna il signal condiviso: chiamata dopo
  // OGNI operazione di scrittura (add/update/remove/coupon), cosi' il carrello mostrato
  // e' sempre calcolato dal server (coerente coi totali ricalcolati in CarrelloMap nel backend)
  ricarica() {
    this.http.get<CarrelloDTO>(this.url).subscribe({
      next: (resp) => this.carrello.set(resp),
    });
  }

  // .pipe(tap(() => this.ricarica())) (teoria cap. 24): dopo ogni scrittura, ricarica
  // automaticamente lo stato — chi chiama addItem() non deve ricordarsi di farlo a mano
  addItem(body: { idVariante: number; quantita: number }) {
    return this.http.post<ResponseDTO>(this.url + '/items', body)
      .pipe(tap(() => this.ricarica()));
  }

  updateItem(body: { idVariante: number; quantita: number }) {
    return this.http.patch<ResponseDTO>(this.url + '/items', body)
      .pipe(tap(() => this.ricarica()));
  }

  removeItem(idVariante: number) {
    return this.http.delete<ResponseDTO>(this.url + '/items/' + idVariante)
      .pipe(tap(() => this.ricarica()));
  }

  applyCoupon(codiceCoupon: string) {
    return this.http.post<ResponseDTO>(this.url + '/coupon', { codiceCoupon })
      .pipe(tap(() => this.ricarica()));
  }

  removeCoupon() {
    return this.http.delete<ResponseDTO>(this.url + '/coupon')
      .pipe(tap(() => this.ricarica()));
  }

  clear() {
    return this.http.delete<ResponseDTO>(this.url + '/clear')
      .pipe(tap(() => this.ricarica()));
  }
}
