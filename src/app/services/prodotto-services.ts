import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../core/api-config';
import { ProdottoDTO, ResponseDTO } from '../models/models';

// ============================================================================
// PROPRIETARIO: Mattia — Catalogo (Categoria / Prodotto / VarianteProdotto)
// ============================================================================
@Injectable({ providedIn: 'root' })
export class ProdottoServices {
  private http = inject(HttpClient);
  private url = API_BASE_URL + '/prodotto/';

  // I 3 filtri sono tutti facoltativi (mirror di ProdottoController.list nel backend):
  // vengono aggiunti ai query params solo se effettivamente passati
  list(filtri?: { idCategoria?: number; marca?: string; nome?: string }) {
    const params: any = {};
    if (filtri?.idCategoria) params.idCategoria = filtri.idCategoria;
    if (filtri?.marca) params.marca = filtri.marca;
    if (filtri?.nome) params.nome = filtri.nome;
    return this.http.get<ProdottoDTO[]>(this.url + 'list', { params });
  }

  getById(id: number) {
    return this.http.get<ProdottoDTO>(this.url + 'getById', { params: { id } });
  }

  // Le 3 sezioni della home: piu' venduti, ultimi aggiunti, tornati disponibili dopo l'esaurimento
  inEvidenza() {
    return this.http.get<ProdottoDTO[]>(this.url + 'inEvidenza');
  }

  novita() {
    return this.http.get<ProdottoDTO[]>(this.url + 'novita');
  }

  nuovamenteDisponibili() {
    return this.http.get<ProdottoDTO[]>(this.url + 'nuovamenteDisponibili');
  }

  create(body: { idCategoria: number; nome: string; marca: string; descrizione?: string }) {
    return this.http.post<ResponseDTO>(this.url + 'create', body);
  }

  update(body: { id: number; idCategoria?: number; nome?: string; marca?: string; descrizione?: string }) {
    return this.http.patch<ResponseDTO>(this.url + 'update', body);
  }

  delete(id: number) {
    return this.http.delete<ResponseDTO>(this.url + 'delete/' + id);
  }
}
