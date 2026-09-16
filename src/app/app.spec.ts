import { TestBed } from '@angular/core/testing';
import { App } from './app';

// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// Test unitario generato automaticamente da "ng new" (mai personalizzato per Hakustore):
// il secondo test cerca ancora il titolo di default "Hello, corso-angular" nel <h1>,
// che pero' non esiste piu' in app.html — quel test fallirebbe se eseguito con "ng test".
describe('App', () => {
  beforeEach(async () => {
    // TestBed (framework di test di Angular): configura un modulo di test isolato
    // in cui "montare" il componente App per verificarne il comportamento
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, corso-angular');
  });
});
