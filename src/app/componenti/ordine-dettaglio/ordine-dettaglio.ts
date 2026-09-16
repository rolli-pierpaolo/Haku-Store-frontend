import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { OrdineServices } from '../../services/ordine-services';
import { OrdineDTO } from '../../models/models';

// ============================================================================
// PROPRIETARIO: Valerio — Ordini (Ordine / DettaglioOrdine / checkout)
// ============================================================================
// Pagina di dettaglio di un singolo ordine: righe acquistate, totali e stato spedizione/pagamento.
@Component({
  selector: 'app-ordine-dettaglio',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './ordine-dettaglio.html',
  styleUrl: './ordine-dettaglio.css',
})
export class OrdineDettaglio implements OnInit {
  private route = inject(ActivatedRoute);
  private ordineS = inject(OrdineServices);

  ordine = signal<OrdineDTO | null>(null);

  ngOnInit(): void {
    // Legge l'id ordine dall'URL (:id nella rotta) — se l'utente prova a vedere
    // un ordine che non gli appartiene, il backend risponde "ordine.forbidden" (403)
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = Number(params.get('id'));
      this.ordineS.getById(id).subscribe({
        next: (resp) => this.ordine.set(resp),
      });
    });
  }
}
