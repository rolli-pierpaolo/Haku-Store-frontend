import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthServices } from '../../auth/auth-services';

// ============================================================================
// PROPRIETARIO: Sarah — Utente, Recensioni & Sicurezza
// ============================================================================
// Pagina di registrazione: form con i dati del nuovo utente, invio al backend e login automatico.
@Component({
  selector: 'app-registrazione',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registrazione.html',
  styleUrl: './registrazione.css',
})
export class Registrazione {
  private auth = inject(AuthServices);
  private router = inject(Router);

  erroreMsg = signal<string | null>(null);

  // Reactive Forms (teoria cap. 22): ogni campo ha i propri Validators, equivalenti
  // lato frontend delle annotazioni @NotNull/@Email/@Size viste in UtenteReq.java nel backend
  registraForm: FormGroup = new FormGroup({
    nome: new FormControl(null, Validators.required),
    cognome: new FormControl(null, Validators.required),
    email: new FormControl(null, [Validators.required, Validators.email]),
    // minLength(8): stessa regola di UtenteReq.password (@Size(min = 8)) nel backend —
    // qui pero' la validazione e' solo comodita' per l'utente (feedback immediato),
    // il backend rivalida tutto comunque, non ci si affida mai solo al frontend
    password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
    telefono: new FormControl(null),
  });

  onSubmit(): void {
    this.erroreMsg.set(null);
    // auth.register(...) chiama /rest/auth/register e, in caso di successo, effettua
    // gia' il login automatico (vedi AuthServices.salvaSessione) — l'utente non deve
    // rifare login subito dopo essersi registrato
    this.auth.register(this.registraForm.value).subscribe({
      next: () => this.router.navigateByUrl('/catalogo'),
      error: (err) => this.erroreMsg.set(err.error?.msg ?? 'Errore durante la registrazione'),
    });
  }
}
