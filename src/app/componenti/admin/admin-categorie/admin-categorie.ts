import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaServices } from '../../../services/categoria-services';
import { UploadServices } from '../../../services/upload-services';
import { CategoriaDTO } from '../../../models/models';
import { API_ORIGIN } from '../../../core/api-config';

// ============================================================================
// PROPRIETARIO: Mattia — Catalogo (Categoria / Prodotto / VarianteProdotto)
// ============================================================================
// Pannello admin CRUD per le categorie. Raggiungibile solo passando dal adminGuardGuard
// (definito in app.routes.ts sulla rotta "admin"), quindi solo un utente ADMIN arriva qui.
@Component({
  selector: 'app-admin-categorie',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-categorie.html',
  styleUrl: './admin-categorie.css',
})
export class AdminCategorie implements OnInit {
  private categoriaS = inject(CategoriaServices);
  private uploadS = inject(UploadServices);

  // esposta al template per costruire l'URL completo delle immagini (path relativo + origine backend)
  readonly apiOrigin = API_ORIGIN;

  categorie = signal<CategoriaDTO[]>([]);
  erroreMsg = signal<string | null>(null);
  // Tiene l'id della categoria in modifica inline nella tabella (null = nessuna riga in editing)
  inModifica = signal<number | null>(null);
  // Tiene l'id della categoria per cui e' in corso un upload immagine (per disabilitare il bottone)
  caricamentoImmagine = signal<number | null>(null);

  nuovaForm = new FormGroup({
    nome: new FormControl('', Validators.required),
  });

  modificaForm = new FormGroup({
    nome: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.carica();
  }

  carica(): void {
    this.categoriaS.list().subscribe({ next: (resp) => this.categorie.set(resp) });
  }

  crea(): void {
    this.erroreMsg.set(null);
    const nome = this.nuovaForm.value.nome;
    if (!nome) return;

    this.categoriaS.create({ nome }).subscribe({
      next: () => {
        this.nuovaForm.reset();
        this.carica();
      },
      // err.error?.msg legge il ResponseDTO{msg} restituito da ExceptionManager nel backend
      // (es. "categoria.nome.exist" gia' tradotto in italiano da IMessaggioServices)
      error: (err) => this.erroreMsg.set(err.error?.msg ?? 'Errore'),
    });
  }

  // Precompila il form di modifica con i dati attuali e attiva la modalita' editing
  // inline per quella specifica riga della tabella
  iniziaModifica(c: CategoriaDTO): void {
    this.inModifica.set(c.id);
    this.modificaForm.setValue({ nome: c.nome });
  }

  salvaModifica(id: number): void {
    this.erroreMsg.set(null);
    const nome = this.modificaForm.value.nome;
    if (!nome) return;

    this.categoriaS.update({ id, nome }).subscribe({
      next: () => {
        this.inModifica.set(null);
        this.carica();
      },
      error: (err) => this.erroreMsg.set(err.error?.msg ?? 'Errore'),
    });
  }

  elimina(id: number): void {
    this.erroreMsg.set(null);
    // Se la categoria ha ancora prodotti collegati, il backend risponde con l'errore
    // "categoria.has.prodotti" invece di cancellare (vedi CategoriaImpl.delete)
    this.categoriaS.delete(id).subscribe({
      next: () => this.carica(),
      error: (err) => this.erroreMsg.set(err.error?.msg ?? 'Errore'),
    });
  }

  // Scatta quando l'utente sceglie un file dall'<input type="file">: stesso schema
  // di onFileSelected() nel dialog Upload del progetto Veicoli, ma senza dialog
  // separato (qui l'upload avviene inline, riga per riga, nella stessa tabella)
  onFileSelected(event: Event, categoria: CategoriaDTO): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.caricaImmagine(file, categoria);

    // permette di ricaricare lo stesso file una seconda volta (altrimenti "change" non riscatterebbe)
    input.value = '';
  }

  private caricaImmagine(file: File, categoria: CategoriaDTO): void {
    this.erroreMsg.set(null);
    this.caricamentoImmagine.set(categoria.id);

    // 1) upload: salva il file sul server e risponde col nome del file salvato
    this.uploadS.uploadImage(file, categoria.id).subscribe({
      next: (r) => {
        // 2) getUrl: trasforma quel nome nel path pubblico da cui scaricarlo
        this.uploadS.getUrl(r.msg).subscribe({
          next: (r2) => {
            categoria.immagine = r2.msg; // aggiorna subito l'anteprima, senza ricaricare tutta la lista
            this.caricamentoImmagine.set(null);
          },
          error: (err) => {
            this.erroreMsg.set(err.error?.msg ?? 'Errore');
            this.caricamentoImmagine.set(null);
          },
        });
      },
      error: (err) => {
        this.erroreMsg.set(err.error?.msg ?? 'Errore');
        this.caricamentoImmagine.set(null);
      },
    });
  }
}
