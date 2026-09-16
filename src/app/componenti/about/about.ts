import { Component } from '@angular/core';

// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// Pagina statica di puro contenuto: nessun service, nessuno stato, "imports: []"
// perche' il template non usa nessuna direttiva/pipe oltre a quelle base sempre disponibili
@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {}
