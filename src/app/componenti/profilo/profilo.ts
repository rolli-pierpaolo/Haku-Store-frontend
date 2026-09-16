import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServices } from '../../auth/auth-services';
import { IndirizzoServices } from '../../services/indirizzo-services';
import { UtenteServices } from '../../services/utente-services';
import { IndirizzoDTO } from '../../models/models';

// ============================================================================
// PROPRIETARIO: Sarah — Utente, Recensioni & Sicurezza
// ============================================================================
// Pagina "il mio profilo": dati anagrafici, indirizzi salvati ed eliminazione account.
@Component({
  selector: 'app-profilo',
  imports: [ReactiveFormsModule],
  templateUrl: './profilo.html',
  styleUrl: './profilo.css',
})
// "implements OnInit" attiva il lifecycle hook ngOnInit (teoria cap. 19): qui, e non nel
// costruttore, vanno le chiamate HTTP iniziali e la lettura dei dati dell'utente loggato
export class Profilo implements OnInit {
  private utenteS = inject(UtenteServices);
  private indirizzoS = inject(IndirizzoServices);
  private router = inject(Router);
  // Non "private": il template deve poterlo leggere direttamente (auth.currentUser())
  auth = inject(AuthServices);

  indirizzi = signal<IndirizzoDTO[]>([]);
  messaggioDati = signal<string | null>(null);
  modificaIndirizzoId = signal<number | null>(null);

  // Due passaggi per l'eliminazione account: il primo click mostra solo l'avviso,
  // il secondo (esplicito, "Sì, elimina") esegue davvero la richiesta al backend
  confermaEliminazioneAccount = signal(false);
  erroreEliminazioneAccount = signal<string | null>(null);

  // Form dei dati anagrafici: nessun Validators.required qui perche' e' un aggiornamento
  // parziale (mirroring del pattern "update parziale" gia' visto in UtenteImpl.update nel backend)
  datiForm = new FormGroup({
    nome: new FormControl(''),
    cognome: new FormControl(''),
    telefono: new FormControl(''),
  });

  nuovoIndirizzoForm = new FormGroup({
    via: new FormControl('', Validators.required),
    citta: new FormControl('', Validators.required),
    cap: new FormControl('', Validators.required),
    provincia: new FormControl(''),
    nazione: new FormControl('Italia'),
  });

  // ngOnInit (teoria cap. 19): eseguito una sola volta, subito dopo la creazione del componente
  ngOnInit(): void {
    const utente = this.auth.currentUser();
    if (utente) {
      // patchValue aggiorna solo i campi indicati, senza toccare gli altri controlli del form
      this.datiForm.patchValue({ nome: utente.nome, cognome: utente.cognome, telefono: utente.telefono });
    }
    this.caricaIndirizzi();
  }

  caricaIndirizzi(): void {
    // .subscribe() (teoria cap. 23-24): senza questa chiamata l'Observable resterebbe
    // "freddo" e la richiesta HTTP non partirebbe mai
    this.indirizzoS.list().subscribe({
      next: (resp) => this.indirizzi.set(resp),
    });
  }

  salvaDati(): void {
    const utente = this.auth.currentUser();
    if (!utente) return;

    this.utenteS.update({ id: utente.idUtente, ...this.datiForm.value } as any).subscribe({
      next: () => {
        this.messaggioDati.set('Dati aggiornati');
        // Aggiorna anche il signal currentUser (in AuthServices) cosi' il resto dell'app
        // (es. la navbar) mostra subito i nuovi dati, senza dover ricaricare la pagina
        this.auth.currentUser.set({ ...utente, ...this.datiForm.value } as any);
      },
      error: (err) => this.messaggioDati.set(err.error?.msg ?? 'Errore'),
    });
  }

  aggiungiIndirizzo(): void {
    this.indirizzoS.create(this.nuovoIndirizzoForm.value as any).subscribe({
      next: () => {
        this.nuovoIndirizzoForm.reset({ nazione: 'Italia' });
        // Ricarica la lista dal server invece di aggiungere l'elemento manualmente
        // all'array locale: piu' semplice e sempre coerente con cio' che ha davvero il backend
        this.caricaIndirizzi();
      },
    });
  }

  eliminaIndirizzo(id: number): void {
    this.indirizzoS.delete(id).subscribe({
      next: () => this.caricaIndirizzi(),
    });
  }

  // Cancella per sempre l'account (e, in cascata sul backend, carrello/indirizzi/recensioni/ordini):
  // dopo la conferma, se il backend risponde bene si fa logout e si torna al catalogo,
  // dato che l'utente non esiste piu' e non avrebbe piu' senso restare su una pagina protetta
  eliminaAccount(): void {
    const utente = this.auth.currentUser();
    if (!utente) return;

    this.erroreEliminazioneAccount.set(null);
    this.utenteS.delete(utente.idUtente).subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigateByUrl('/catalogo');
      },
      error: (err) => this.erroreEliminazioneAccount.set(err.error?.msg ?? 'Errore'),
    });
  }
}
