// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// Unico punto in cui e' scritto l'indirizzo del backend: ogni service (Categoria,
// Prodotto, Carrello, Ordine, Utente...) importa questa costante invece di scrivere
// l'URL a mano, cosi' cambiarlo (es. per andare in produzione) richiede una sola riga
export const API_ORIGIN = 'http://localhost:9090';
export const API_BASE_URL = API_ORIGIN + '/rest';
