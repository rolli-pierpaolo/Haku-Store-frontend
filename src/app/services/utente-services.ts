import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../core/api-config';
import { ResponseDTO, UtenteDTO } from '../models/models';

// ============================================================================
// PROPRIETARIO: Sarah — Utente, Recensioni & Sicurezza
// ============================================================================
// Service (teoria cap. 20): centralizza tutte le chiamate HTTP verso /rest/utente,
// cosi' i componenti (Profilo, ecc.) non chiamano mai HttpClient direttamente —
// best practice esplicita anche in teoria (cap. 28).
@Injectable({ providedIn: 'root' })
export class UtenteServices {
  private http = inject(HttpClient);
  private url = API_BASE_URL + '/utente/';

  // Corrisponde a UtenteController.me() nel backend: scorciatoia per "il mio profilo",
  // il backend deriva l'utente dal token JWT (allegato automaticamente da authInterceptor)
  me() {
    return this.http.get<UtenteDTO>(this.url + 'me');
  }

  getById(id: number) {
    return this.http.get<UtenteDTO>(this.url + 'getById', { params: { id } });
  }

  list() {
    return this.http.get<UtenteDTO[]>(this.url + 'list');
  }

  // http.patch, non put: aggiornamento PARZIALE, tutti i campi tranne id sono opzionali
  update(body: { id: number; nome?: string; cognome?: string; email?: string; password?: string; telefono?: string }) {
    return this.http.patch<ResponseDTO>(this.url + 'update', body);
  }

  delete(id: number) {
    return this.http.delete<ResponseDTO>(this.url + 'delete/' + id);
  }
}
