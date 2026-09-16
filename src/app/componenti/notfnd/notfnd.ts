import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// La pagina mostrata dalla rotta wildcard "**" in app.routes.ts, per qualunque
// URL non riconosciuto dall'app
@Component({
  selector: 'app-notfnd',
  imports: [RouterLink],
  templateUrl: './notfnd.html',
  styleUrl: './notfnd.css',
})
export class Notfnd {}
