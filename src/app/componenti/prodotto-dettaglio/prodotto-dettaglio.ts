import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { AuthServices } from '../../auth/auth-services';
import { CarrelloServices } from '../../services/carrello-services';
import { ProdottoServices } from '../../services/prodotto-services';
import { RecensioneServices } from '../../services/recensione-services';
import { ProdottoDTO, RecensioneDTO, VarianteProdottoDTO } from '../../models/models';
import { generaImmagineProdotto } from '../../utils/immagine-prodotto';
import { API_ORIGIN } from '../../core/api-config';

// ============================================================================
// PROPRIETARIO: Mattia — Catalogo (Categoria / Prodotto / VarianteProdotto)
// ============================================================================
// Pagina di dettaglio prodotto: incrocia 3 moduli diversi (Prodotto di Mattia,
// Recensione di Sarah, Carrello di Pier) esattamente come nel backend
@Component({
  selector: 'app-prodotto-dettaglio',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './prodotto-dettaglio.html',
  styleUrl: './prodotto-dettaglio.css',
})
export class ProdottoDettaglio implements OnInit {
  private route = inject(ActivatedRoute);
  private prodottoS = inject(ProdottoServices);
  // Collegamento verso il modulo di Sarah (recensioni) e di Pier (carrello): il componente
  // di dettaglio prodotto orchestra tutti e tre, ma i service restano ciascuno nel proprio dominio
  private recensioneS = inject(RecensioneServices);
  private carrelloS = inject(CarrelloServices);
  auth = inject(AuthServices);

  idProdotto!: number;
  prodotto = signal<ProdottoDTO | null>(null);
  recensioni = signal<RecensioneDTO[]>([]);
  varianteSelezionata = signal<VarianteProdottoDTO | null>(null);
  messaggioCarrello = signal<string | null>(null);

  // Media voti + conteggio, ricalcolata automaticamente ogni volta che recensioni() cambia
  // (computed, teoria cap. 16): null se non c'e' ancora nessuna recensione
  mediaVoto = computed(() => {
    const r = this.recensioni();
    if (r.length === 0) return null;
    return { media: r.reduce((acc, x) => acc + x.voto, 0) / r.length, count: r.length };
  });
  // Esposto al template per arrotondare la media alla stella piu' vicina (Math.round non e'
  // richiamabile direttamente nell'HTML, serve un riferimento sulla classe)
  round = Math.round;

  quantitaForm = new FormGroup({
    quantita: new FormControl(1, [Validators.required, Validators.min(1)]),
  });

  recensioneForm = new FormGroup({
    voto: new FormControl(5, [Validators.required, Validators.min(1), Validators.max(5)]),
    titolo: new FormControl(''),
    commento: new FormControl(''),
  });

  ngOnInit(): void {
    // route.paramMap e' un Observable (teoria cap. 21/24): si iscrive per reagire anche
    // se l'utente naviga da un prodotto a un altro senza distruggere il componente
    // (es. da /prodotto/1 a /prodotto/2 tramite un link), non solo al primo caricamento
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.idProdotto = Number(params.get('id'));
      this.caricaProdotto();
      this.caricaRecensioni();
    });
  }

  caricaProdotto(): void {
    this.prodottoS.getById(this.idProdotto).subscribe({
      next: (resp) => {
        this.prodotto.set(resp);
        // Preseleziona la prima variante DISPONIBILE (stock > 0), altrimenti la prima in assoluto
        const disponibile = resp.varianti.find((v) => v.quantitaDisponibile > 0);
        this.varianteSelezionata.set(disponibile ?? resp.varianti[0] ?? null);
      },
    });
  }

  caricaRecensioni(): void {
    this.recensioneS.listByProdotto(this.idProdotto).subscribe({
      next: (resp) => this.recensioni.set(resp),
    });
  }

  selezionaVariante(v: VarianteProdottoDTO): void {
    this.varianteSelezionata.set(v);
    this.quantitaForm.patchValue({ quantita: 1 });
  }

  // Raggruppa le varianti per gusto+colore (stesso gusto = stesso gruppo, indipendentemente
  // dal formato): cosi' nella griglia non si vede una scheda per OGNI combinazione, ma una
  // scheda per gusto con dentro un menu a tendina per scegliere solo il formato
  gruppiVarianti = computed(() => {
    const p = this.prodotto();
    if (!p) return [];

    const mappa = new Map<string, VarianteProdottoDTO[]>();
    for (const v of p.varianti) {
      const chiave = `${v.gusto ?? ''}|${v.colore ?? ''}`;
      if (!mappa.has(chiave)) mappa.set(chiave, []);
      mappa.get(chiave)!.push(v);
    }

    return Array.from(mappa.values()).map((varianti) => ({
      gusto: varianti[0].gusto,
      colore: varianti[0].colore,
      varianti,
    }));
  });

  // Il formato "attivo" da mostrare nella tendina di un gruppo: quello effettivamente
  // selezionato se appartiene a questo gruppo, altrimenti il primo disponibile del
  // gruppo (o il primo in assoluto se sono esaurite tutte) — solo un'anteprima, non
  // seleziona nulla finche' l'utente non interagisce con la scheda
  formatoAttivo(g: { varianti: VarianteProdottoDTO[] }): VarianteProdottoDTO {
    const sel = this.varianteSelezionata();
    if (sel && g.varianti.some((v) => v.id === sel.id)) return sel;
    return g.varianti.find((v) => v.quantitaDisponibile > 0) ?? g.varianti[0];
  }

  tutteEsaurite(g: { varianti: VarianteProdottoDTO[] }): boolean {
    return g.varianti.every((v) => v.quantitaDisponibile <= 0);
  }

  selezionaFormato(g: { varianti: VarianteProdottoDTO[] }, idVariante: number): void {
    const v = g.varianti.find((x) => x.id === idVariante);
    if (v) this.selezionaVariante(v);
  }

  aggiungiAlCarrello(): void {
    const variante = this.varianteSelezionata();
    if (!variante || variante.quantitaDisponibile <= 0) return;

    // Doppio controllo lato client: non permettere di chiedere piu' pezzi di quelli
    // disponibili (il backend comunque rivalida tutto al checkout, questo e' solo UX)
    const quantita = Math.min(this.quantitaForm.value.quantita ?? 1, variante.quantitaDisponibile);

    this.messaggioCarrello.set(null);
    this.carrelloS.addItem({ idVariante: variante.id, quantita }).subscribe({
      next: () => this.messaggioCarrello.set('Aggiunto al carrello!'),
      error: (err) => this.messaggioCarrello.set(err.error?.msg ?? 'Errore'),
    });
  }

  immagineDi(p: ProdottoDTO): string {
    // se la variante selezionata ha una sua foto (caricata da Admin -> Prodotti -> Immagine
    // variante), ha la priorita' su tutto: e' la foto piu' specifica per quello che il
    // cliente sta effettivamente per comprare (es. gusto/colore diverso = foto diversa)
    const variante = this.varianteSelezionata();
    if (variante?.immagine) return API_ORIGIN + variante.immagine;

    // se il prodotto ha una foto vera (caricata da Admin -> Prodotti), si usa quella:
    // il disegno generato serve solo finche' nessuno ha ancora caricato una foto reale
    if (p.immagine) return API_ORIGIN + p.immagine;

    // se la categoria ha una foto, il disegno generato lascia libero l'angolo (niente "H"):
    // ci sara' sovrapposta la vera foto tramite un <img> separato, vedi immagineCategoriaDi()
    return generaImmagineProdotto(p.nome, p.marca, p.categoria?.nome ?? '', !!p.categoria?.immagine);
  }

  // URL completo della foto categoria da mostrare come bollino, sempre (sopra il disegno
  // generato o sopra la foto vera del prodotto): null solo se la categoria non ne ha una
  immagineCategoriaDi(p: ProdottoDTO): string | null {
    return p.categoria?.immagine ? API_ORIGIN + p.categoria.immagine : null;
  }

  inviaRecensione(): void {
    this.recensioneS.create({
      idProdotto: this.idProdotto,
      voto: this.recensioneForm.value.voto ?? 5,
      titolo: this.recensioneForm.value.titolo ?? undefined,
      commento: this.recensioneForm.value.commento ?? undefined,
    }).subscribe({
      next: () => {
        this.recensioneForm.reset({ voto: 5, titolo: '', commento: '' });
        this.caricaRecensioni();
      },
    });
  }
}
