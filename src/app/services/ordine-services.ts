import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../core/api-config';
import { OrdineDTO, ResponseDTO } from '../models/models';

// ============================================================================
// PROPRIETARIO: Valerio — Ordini (Ordine / DettaglioOrdine / checkout)
// ============================================================================
// Questo service parla con il backend per il checkout e per consultare gli ordini gia' fatti.
@Injectable({ providedIn: 'root' })
export class OrdineServices {
  private http = inject(HttpClient);
  private url = API_BASE_URL + '/ordine/';

  // Trasforma il carrello attivo in un ordine (OrdineImpl.checkout nel backend):
  // idUtente non viene mai passato, il backend lo ricava dal token JWT
  checkout(body: { idIndirizzo: number; metodoPagamento: string }) {
    return this.http.post<OrdineDTO>(this.url + 'checkout', body);
  }

  // Filtri tutti opzionali: per un CLIENTE il backend ignora idUtente e mostra
  // comunque solo i propri ordini; per un ADMIN puo' filtrare per un utente specifico
  list(filtri?: { idUtente?: number; stato?: string; statoPagamento?: string }) {
    const params: any = {};
    if (filtri?.idUtente) params.idUtente = filtri.idUtente;
    if (filtri?.stato) params.stato = filtri.stato;
    if (filtri?.statoPagamento) params.statoPagamento = filtri.statoPagamento;
    return this.http.get<OrdineDTO[]>(this.url + 'list', { params });
  }

  getById(id: number) {
    return this.http.get<OrdineDTO>(this.url + 'getById', { params: { id } });
  }

  // Solo ADMIN lato backend (@PreAuthorize): cambia lo stato logistico
  updateStato(body: { id: number; stato: string }) {
    return this.http.patch<ResponseDTO>(this.url + 'updateStato', body);
  }

  // Asse indipendente dallo stato logistico: lo stato del pagamento
  updateStatoPagamento(body: { id: number; statoPagamento: string }) {
    return this.http.patch<ResponseDTO>(this.url + 'updateStatoPagamento', body);
  }
}
