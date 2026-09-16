import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../core/api-config';
import { ResponseDTO, VarianteProdottoDTO } from '../models/models';

// ============================================================================
// PROPRIETARIO: Mattia — Catalogo (Categoria / Prodotto / VarianteProdotto)
// ============================================================================
// Questo service parla con il backend per leggere/creare/modificare/cancellare le varianti di un prodotto.
@Injectable({ providedIn: 'root' })
export class VarianteServices {
  private http = inject(HttpClient);
  private url = API_BASE_URL + '/varianteProdotto/';

  listByProdotto(idProdotto: number) {
    return this.http.get<VarianteProdottoDTO[]>(this.url + 'list', { params: { idProdotto } });
  }

  getById(id: number) {
    return this.http.get<VarianteProdottoDTO>(this.url + 'getById', { params: { id } });
  }

  create(body: { idProdotto: number; gusto?: string; formato?: string; colore?: string; prezzo: number; quantitaDisponibile?: number }) {
    return this.http.post<ResponseDTO>(this.url + 'create', body);
  }

  // Usato anche solo per aggiornare quantitaDisponibile dal pannello admin: essendo
  // un update parziale, passare solo quel campo lascia intatti gli altri (stesso
  // pattern Optional.ofNullable visto in VarianteProdottoImpl.update nel backend)
  update(body: { id: number; gusto?: string; formato?: string; colore?: string; prezzo?: number; quantitaDisponibile?: number }) {
    return this.http.patch<ResponseDTO>(this.url + 'update', body);
  }

  delete(id: number) {
    return this.http.delete<ResponseDTO>(this.url + 'delete/' + id);
  }
}
