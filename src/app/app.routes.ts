import { Routes } from '@angular/router';
import { Home } from './componenti/home/home';
import { About } from './componenti/about/about';
import { Notfnd } from './componenti/notfnd/notfnd';
import { Login } from './componenti/login/login';
import { Registrazione } from './componenti/registrazione/registrazione';
import { ProdottoDettaglio } from './componenti/prodotto-dettaglio/prodotto-dettaglio';
import { Carrello } from './componenti/carrello/carrello';
import { Checkout } from './componenti/checkout/checkout';
import { OrdiniList } from './componenti/ordini-list/ordini-list';
import { OrdineDettaglio } from './componenti/ordine-dettaglio/ordine-dettaglio';
import { Profilo } from './componenti/profilo/profilo';
import { AdminLayout } from './componenti/admin/admin-layout/admin-layout';
import { AdminCategorie } from './componenti/admin/admin-categorie/admin-categorie';
import { AdminProdotti } from './componenti/admin/admin-prodotti/admin-prodotti';
import { AdminCoupon } from './componenti/admin/admin-coupon/admin-coupon';
import { AdminOrdini } from './componenti/admin/admin-ordini/admin-ordini';
import { authGuardGuard } from './auth/auth-guard-guard';
import { adminGuardGuard } from './auth/admin-guard-guard';

// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// La mappa di tutte le "pagine" dell'app (teoria cap. 21): ogni oggetto collega
// un path dell'URL a un componente. E' il punto in cui si vede a colpo d'occhio
// il lavoro di tutte e 4 le persone del team riunito in un'unica applicazione.
export const routes: Routes = [
    // pathMatch:'full' + redirectTo: la home "/" rimanda subito al catalogo
    {path :'', pathMatch:'full', redirectTo:'catalogo'},
    // Rotte pubbliche (Mattia/Sarah): nessun canActivate, accessibili anche senza login
    {path:'catalogo', component:Home},
    // ":id" e' un parametro di rotta (teoria cap. 21): letto con ActivatedRoute nel componente
    {path:'prodotto/:id', component:ProdottoDettaglio},
    {path:'about', component:About},
    {path:'login', component:Login},
    {path:'registrati', component:Registrazione},

    // Rotte protette da authGuardGuard (Sarah): serve solo essere autenticati
    {path:'carrello', component:Carrello, canActivate:[authGuardGuard]},
    {path:'checkout', component:Checkout, canActivate:[authGuardGuard]},
    {path:'ordini', component:OrdiniList, canActivate:[authGuardGuard]},
    {path:'ordini/:id', component:OrdineDettaglio, canActivate:[authGuardGuard]},
    {path:'profilo', component:Profilo, canActivate:[authGuardGuard]},

    // Rotte annidate (children, teoria cap. 21): tutte le pagine admin condividono
    // lo stesso AdminLayout come "guscio" (sidebar + <router-outlet> interno), e sono
    // protette da adminGuardGuard — serve sia login sia ruolo ADMIN
    {path:'admin', component:AdminLayout, canActivate:[adminGuardGuard], children:[
        {path:'', pathMatch:'full', redirectTo:'categorie'},
        {path:'categorie', component:AdminCategorie},
        {path:'prodotti', component:AdminProdotti},
        {path:'coupon', component:AdminCoupon},
        {path:'ordini', component:AdminOrdini},
    ]},

    // Rotta wildcard "**" (teoria cap. 21): cattura qualunque URL non riconosciuto
    // sopra e lo rimanda alla pagina 404 — va sempre messa per ultima
    {path:'404', component:Notfnd},
    {path: '**', redirectTo: '404'}
];
