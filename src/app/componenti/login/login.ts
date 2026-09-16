import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthServices } from '../../auth/auth-services';

// ============================================================================
// PROPRIETARIO: Sarah — Utente, Recensioni & Sicurezza
// ============================================================================
// Componente standalone (teoria cap. 25): niente NgModule, dichiara da solo tramite
// "imports" i moduli Angular che gli servono (qui: ReactiveFormsModule per i form, RouterLink
// per i link di navigazione). E' la forma di default dei componenti da Angular 17 in poi.
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // inject() e' l'equivalente "a funzione" della Dependency Injection (teoria cap. 20):
  // Angular fornisce l'istanza gia' pronta, senza dover scrivere "new AuthServices()"
  private auth = inject(AuthServices);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // signal (teoria cap. 26): il messaggio d'errore e' uno stato reattivo — quando cambia,
  // il blocco @if nel template si aggiorna da solo
  erroreMsg = signal<string | null>(null);

  // Reactive Forms (teoria cap. 22): la logica e i validatori stanno qui nella classe
  // TypeScript, non nel template — approccio piu' potente e testabile del template-driven
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, Validators.required),
  });

  onSubmit(): void {
    this.erroreMsg.set(null);
    // auth.login(...) restituisce un Observable (teoria cap. 23-24): senza .subscribe()
    // la richiesta HTTP non partirebbe nemmeno
    this.auth.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
      next: () => {
        // Legge il parametro returnUrl dall'URL (teoria cap. 21, ActivatedRoute):
        // e' li' che l'authGuardGuard mette la pagina originale a cui si voleva accedere
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/catalogo';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        // err.error e' il corpo JSON della risposta di errore del backend: {"msg": "..."}
        // (lo stesso ResponseDTO/ExceptionManager visti nel backend)
        this.erroreMsg.set(err.error?.msg ?? 'Errore durante il login');
      },
    });
  }
}
