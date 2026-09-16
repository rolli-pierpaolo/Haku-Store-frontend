import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProdottoDTO } from '../../models/models';
import { generaImmagineProdotto } from '../../utils/immagine-prodotto';
import { API_ORIGIN } from '../../core/api-config';

// ============================================================================
// PROPRIETARIO: Mattia — Catalogo (Categoria / Prodotto / VarianteProdotto)
// ============================================================================
// Scheda prodotto riusata sia nel catalogo completo sia nelle 3 vetrine della home
// (in evidenza/novita'/nuovamente disponibile): stessa card, dati diversi in ingresso
@Component({
  selector: 'app-prodotto-card',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './prodotto-card.html',
})
export class ProdottoCard {
  // input() (Angular 17+, signal-based): equivalente a @Input() ma esposto come segnale,
  // cosi' si legge con p() invece di un normale campo
  p = input.required<ProdottoDTO>();

  immagineDi(p: ProdottoDTO): string {
    // se il prodotto ha una foto propria (caricata da Admin -> Prodotti), quella vince sempre
    if (p.immagine) return API_ORIGIN + p.immagine;

    // altrimenti, qui non c'e' nessuna variante "selezionata" come nel dettaglio prodotto:
    // si preferisce il gusto neutro/naturale come rappresentante del prodotto (es. Farina
    // d'Avena non deve mostrare a caso "Oreo" invece di "Neutro" solo perche' e' stato
    // creato prima), altrimenti la prima variante con una foto reale (preferendo una disponibile)
    const varianti = p.varianti ?? [];
    const neutra = varianti.find((v) => v.immagine && /neutro|natural/i.test(v.gusto ?? ''));
    const variante = neutra ?? varianti.find((v) => v.immagine && v.quantitaDisponibile > 0) ?? varianti.find((v) => v.immagine);
    if (variante?.immagine) return API_ORIGIN + variante.immagine;

    return generaImmagineProdotto(p.nome, p.marca, p.categoria?.nome ?? '', !!p.categoria?.immagine);
  }

  immagineCategoriaDi(p: ProdottoDTO): string | null {
    return p.categoria?.immagine ? API_ORIGIN + p.categoria.immagine : null;
  }

  // Un prodotto puo' avere piu' varianti (gusti/formati) con prezzi diversi:
  // in lista si mostra sempre "da [prezzo piu' basso]"
  prezzoMinimo(p: ProdottoDTO): number | null {
    if (!p.varianti?.length) return null;
    return Math.min(...p.varianti.map((v) => v.prezzo));
  }
}
