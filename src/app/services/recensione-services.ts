import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../core/api-config';
import { RecensioneDTO, ResponseDTO } from '../models/models';

// ============================================================================
// PROPRIETARIO: Sarah — Utente, Recensioni & Sicurezza
// ============================================================================
// Questo service parla con il backend per leggere e scrivere le recensioni sui prodotti.
@Injectable({ providedIn: 'root' })
export class RecensioneServices {
  private http = inject(HttpClient);
  private url = API_BASE_URL + '/recensione/';

  // Endpoint pubblico (nessun token richiesto): visibile anche a chi non e' loggato,
  // come da SecurityConfig del backend (GET /rest/recensione/list e' in permitAll)
  listByProdotto(idProdotto: number) {
    return this.http.get<RecensioneDTO[]>(this.url + 'list', { params: { idProdotto } });
  }

  create(body: { idProdotto: number; voto: number; titolo?: string; commento?: string }) {
    return this.http.post<ResponseDTO>(this.url + 'create', body);
  }

  update(body: { id: number; voto?: number; titolo?: string; commento?: string }) {
    return this.http.patch<ResponseDTO>(this.url + 'update', body);
  }

  delete(id: number) {
    return this.http.delete<ResponseDTO>(this.url + 'delete/' + id);
  }
}
