import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../core/api-config';
import { CategoriaDTO, ResponseDTO } from '../models/models';

// ============================================================================
// PROPRIETARIO: Mattia — Catalogo (Categoria / Prodotto / VarianteProdotto)
// ============================================================================
// Questo service parla con il backend per leggere/creare/modificare/cancellare le categorie.
@Injectable({ providedIn: 'root' })
export class CategoriaServices {
  private http = inject(HttpClient);
  private url = API_BASE_URL + '/categoria/';

  // Nessun token richiesto per la lettura: corrisponde alle GET pubbliche
  // (permitAll in SecurityConfig) del backend
  list() {
    return this.http.get<CategoriaDTO[]>(this.url + 'list');
  }

  getById(id: number) {
    return this.http.get<CategoriaDTO>(this.url + 'getById', { params: { id } });
  }

  // create/update/delete richiedono ADMIN lato backend (@PreAuthorize): se un utente
  // normale li chiamasse, il backend risponderebbe 403 anche se il frontend permettesse la chiamata
  create(body: { nome: string }) {
    return this.http.post<ResponseDTO>(this.url + 'create', body);
  }

  update(body: { id: number; nome?: string }) {
    return this.http.patch<ResponseDTO>(this.url + 'update', body);
  }

  delete(id: number) {
    return this.http.delete<ResponseDTO>(this.url + 'delete/' + id);
  }
}
