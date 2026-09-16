import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CarrelloServices } from '../../services/carrello-services';
import { IndirizzoServices } from '../../services/indirizzo-services';
import { OrdineServices } from '../../services/ordine-services';
import { IndirizzoDTO } from '../../models/models';

// ============================================================================
// PROPRIETARIO: Valerio — Ordini (Ordine / DettaglioOrdine / checkout)
// ============================================================================
// La pagina che chiude il flusso di vendita: legge il carrello di Pier, gli indirizzi
// di Sarah, e chiama OrdineServices.checkout — l'equivalente frontend del "cuore"
// di OrdineImpl.checkout nel backend.
@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private indirizzoS = inject(IndirizzoServices);
  private ordineS = inject(OrdineServices);
  private router = inject(Router);
  carrelloS = inject(CarrelloServices);

  indirizzi = signal<IndirizzoDTO[]>([]);
  mostraNuovoIndirizzo = signal(false);
  erroreMsg = signal<string | null>(null);

  checkoutForm = new FormGroup({
    idIndirizzo: new FormControl<number | null>(null, Validators.required),
    metodoPagamento: new FormControl('CARTA', Validators.required),
  });

  nuovoIndirizzoForm = new FormGroup({
    via: new FormControl('', Validators.required),
    citta: new FormControl('', Validators.required),
    cap: new FormControl('', Validators.required),
    provincia: new FormControl(''),
    nazione: new FormControl('Italia'),
  });

  ngOnInit(): void {
    this.carrelloS.ricarica();
    this.caricaIndirizzi();
  }

  caricaIndirizzi(): void {
    this.indirizzoS.list().subscribe({
      next: (resp) => {
        this.indirizzi.set(resp);
        // Se non ha nessun indirizzo salvato, mostra subito il form per crearne uno
        this.mostraNuovoIndirizzo.set(resp.length === 0);
        // Preseleziona il primo indirizzo disponibile, per comodita'
        if (resp.length > 0) this.checkoutForm.patchValue({ idIndirizzo: resp[0].id });
      },
    });
  }

  creaIndirizzo(): void {
    this.indirizzoS.create(this.nuovoIndirizzoForm.value as any).subscribe({
      next: () => {
        this.nuovoIndirizzoForm.reset({ nazione: 'Italia' });
        this.mostraNuovoIndirizzo.set(false);
        this.caricaIndirizzi();
      },
    });
  }

  confermaOrdine(): void {
    this.erroreMsg.set(null);
    const idIndirizzo = this.checkoutForm.value.idIndirizzo;
    const metodoPagamento = this.checkoutForm.value.metodoPagamento;
    if (!idIndirizzo || !metodoPagamento) return;

    // Questa singola chiamata scatena, lato backend, tutta la logica di checkout:
    // validazione stock, ri-validazione coupon, congelamento prezzi, decremento stock,
    // svuotamento carrello — qui il frontend riceve semplicemente l'ordine gia' creato
    this.ordineS.checkout({ idIndirizzo, metodoPagamento }).subscribe({
      next: (ordine) => {
        // Il carrello sul backend e' gia' stato svuotato dal checkout: si ricarica
        // qui solo per allineare lo stato locale (es. il contatore nella navbar)
        this.carrelloS.ricarica();
        this.router.navigate(['/ordini', ordine.id]);
      },
      // Puo' arrivare "variante.stock.insufficient" se nel frattempo lo stock e' cambiato,
      // o un errore relativo al coupon se e' scaduto proprio ora (vedi teoria del backend)
      error: (err) => this.erroreMsg.set(err.error?.msg ?? 'Errore durante il checkout'),
    });
  }
}
