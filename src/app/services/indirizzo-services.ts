import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../core/api-config';
import { IndirizzoDTO, ResponseDTO } from '../models/models';

// ============================================================================
// PROPRIETARIO: Sarah — Utente, Recensioni & Sicurezza
// ============================================================================
// Questo service parla con il backend per gli indirizzi di spedizione dell'utente loggato.
@Injectable({ providedIn: 'root' })
export class IndirizzoServices {
  private http = inject(HttpClient);
  private url = API_BASE_URL + '/indirizzo/';

  // Nessun idUtente passato qui: il backend lo ricava sempre dal token JWT (mai dal
  // client), esattamente come spiegato nel backend per IndirizzoController/IndirizzoImpl
  list() {
    return this.http.get<IndirizzoDTO[]>(this.url + 'list');
  }

  getById(id: number) {
    return this.http.get<IndirizzoDTO>(this.url + 'getById', { params: { id } });
  }

  create(body: { via: string; citta: string; cap: string; provincia?: string; nazione?: string }) {
    return this.http.post<ResponseDTO>(this.url + 'create', body);
  }

  update(body: { id: number; via?: string; citta?: string; cap?: string; provincia?: string; nazione?: string }) {
    return this.http.patch<ResponseDTO>(this.url + 'update', body);
  }

  delete(id: number) {
    return this.http.delete<ResponseDTO>(this.url + 'delete/' + id);
  }
}
