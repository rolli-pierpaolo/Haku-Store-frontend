import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrdineServices } from '../../services/ordine-services';
import { OrdineDTO } from '../../models/models';

// ============================================================================
// PROPRIETARIO: Valerio — Ordini (Ordine / DettaglioOrdine / checkout)
// ============================================================================
// Pagina "i miei ordini": mostra l'elenco degli ordini fatti dall'utente loggato.
@Component({
  selector: 'app-ordini-list',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './ordini-list.html',
  styleUrl: './ordini-list.css',
})
export class OrdiniList implements OnInit {
  private ordineS = inject(OrdineServices);

  ordini = signal<OrdineDTO[]>([]);

  ngOnInit(): void {
    // Nessun filtro passato: il backend, sapendo che il chiamante non e' ADMIN,
    // restituisce automaticamente solo gli ordini di questo utente
    this.ordineS.list().subscribe({
      next: (resp) => this.ordini.set(resp),
    });
  }
}
