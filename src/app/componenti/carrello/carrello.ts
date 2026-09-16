import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CarrelloServices } from '../../services/carrello-services';
import { DettaglioCarrelloDTO } from '../../models/models';

// ============================================================================
// PROPRIETARIO: Pier — Carrello (Carrello / DettaglioCarrello / Coupon)
// ============================================================================
// Pagina del carrello: mostra le righe, permette di cambiare quantita', rimuovere articoli
// e applicare/togliere un coupon.
@Component({
  selector: 'app-carrello',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './carrello.html',
  styleUrl: './carrello.css',
})
export class Carrello implements OnInit {
  // Non "private": il template legge direttamente carrelloS.carrello() (il signal condiviso)
  carrelloS = inject(CarrelloServices);

  erroreCoupon = signal<string | null>(null); // se il backend rifiuta un coupon, mostra il messaggio di errore qui

  couponForm = new FormGroup({
    codice: new FormControl(''),
  });// FormGroup per il campo "codice" del coupon, legato al template con formControlName="codice"

  ngOnInit(): void {
    this.carrelloS.ricarica();
  }

  // Nessun controllo di scorta qui: il backend rifiuta comunque una quantita' superiore
  // allo stock (o quando poi si tenta il checkout), quindi basta un controllo minimo lato client
  aggiornaQuantita(riga: DettaglioCarrelloDTO, quantita: number): void {
    if (quantita < 1) return;
    // .subscribe() senza next/error: qui basta che la richiesta parta, il tap() dentro
    // CarrelloServices.updateItem ricarica gia' da solo lo stato condiviso
    this.carrelloS.updateItem({ idVariante: riga.variante.id, quantita }).subscribe();
  }

  rimuovi(riga: DettaglioCarrelloDTO): void {
    this.carrelloS.removeItem(riga.variante.id).subscribe();
  }

  applicaCoupon(): void {
    this.erroreCoupon.set(null);
    const codice = this.couponForm.value.codice;
    if (!codice) return;

    // Se il coupon non e' valido, il backend risponde con l'errore specifico
    // (coupon.ntfnd / coupon.not.active / coupon.expired...), mostrato qui cosi' com'e'
    this.carrelloS.applyCoupon(codice).subscribe({
      next: () => this.couponForm.reset(),
      error: (err) => this.erroreCoupon.set(err.error?.msg ?? 'Coupon non valido'),
    });
  }

  rimuoviCoupon(): void {
    this.carrelloS.removeCoupon().subscribe();
  }
}
