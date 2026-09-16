import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ORIGIN } from '../core/api-config';
import { ResponseDTO } from '../models/models';

export type TipoUpload = 'categoria' | 'variante';

// ============================================================================
// PROPRIETARIO: Mattia — Catalogo (Categoria / Prodotto / VarianteProdotto)
// ============================================================================
// Stesso pattern di upload-services.ts nel progetto Veicoli: upload() salva il file
// e risponde col nome del file salvato, getUrl() lo trasforma nel path pubblico da
// cui scaricarlo. A differenza degli altri service di questo progetto, questi
// endpoint NON sono sotto /rest (per questo si usa API_ORIGIN e non API_BASE_URL).
// "tipo" in piu' rispetto a Veicoli: qui serve per dire al backend a quale entita'
// appartiene "id" (categoria o variante: due entita' diverse con la propria immagine).
@Injectable({ providedIn: 'root' })
export class UploadServices {
  private http = inject(HttpClient);
  private url = API_ORIGIN + '/upload/admin/';

  // "id" e' l'id dell'entita' (categoria o variante) a cui appartiene l'immagine (richiede token ADMIN)
  uploadImage(file: File, id: number, tipo: TipoUpload = 'categoria') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', String(id));
    formData.append('tipo', tipo);

    return this.http.post<ResponseDTO>(this.url + 'image', formData);
  }

  getUrl(filename: string, tipo: TipoUpload = 'categoria') {
    const params = new HttpParams().set('filename', filename).set('tipo', tipo);
    return this.http.get<ResponseDTO>(this.url + 'getUrl', { params });
  }
}
