import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../core/api-config';
import { CouponDTO, ResponseDTO } from '../models/models';

// ============================================================================
// PROPRIETARIO: Pier — Carrello (Carrello / DettaglioCarrello / Coupon)
// ============================================================================
// Tutti gli endpoint di CouponController nel backend richiedono ADMIN
// (@PreAuthorize a livello di classe): questo service e' usato solo dal pannello admin,
// mai dal carrello del cliente (che invece applica un coupon per codice via CarrelloServices)
@Injectable({ providedIn: 'root' })
export class CouponServices {
  private http = inject(HttpClient);
  private url = API_BASE_URL + '/coupon/';

  list() {
    return this.http.get<CouponDTO[]>(this.url + 'list');
  }

  getById(id: number) {
    return this.http.get<CouponDTO>(this.url + 'getById', { params: { id } });
  }

  create(body: { codice: string; tipologia: string; valore: number; dataInizio: string; dataFine: string }) {
    return this.http.post<ResponseDTO>(this.url + 'create', body);
  }

  update(body: { id: number; codice?: string; tipologia?: string; valore?: number; dataInizio?: string; dataFine?: string; isAttivo?: boolean }) {
    return this.http.patch<ResponseDTO>(this.url + 'update', body);
  }

  delete(id: number) {
    return this.http.delete<ResponseDTO>(this.url + 'delete/' + id);
  }
}
