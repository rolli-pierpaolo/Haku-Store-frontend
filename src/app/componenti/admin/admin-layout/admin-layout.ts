import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// Il "guscio" condiviso da tutte le pagine admin (categorie/prodotti/coupon/ordini):
// nessuna logica propria, serve solo a mostrare il sottomenu e un secondo
// <router-outlet> ANNIDATO (teoria cap. 21, rotte "children" in app.routes.ts) —
// per questo la classe e' vuota, tutto il lavoro e' nel template
@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {}
