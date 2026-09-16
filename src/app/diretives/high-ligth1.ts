import { Directive, ElementRef, HostListener, Input } from '@angular/core';

// ============================================================================
// PROPRIETARIO: Infrastruttura condivisa (non appartiene a una sola persona)
// ============================================================================
// Direttiva personalizzata (teoria cap. 16): quasi identica all'esempio EvidenziaDirective
// della guida — cambia il colore di sfondo di un elemento al passaggio del mouse.
// selector: '[appHighLigth1]' (tra parentesi quadre): si applica come ATTRIBUTO su
// qualunque tag HTML, es. <p [appHighLigth1]="'yellow'" defaultColor="white">
@Directive({
  selector: '[appHighLigth1]',
  standalone: true
})
export class HighLigth1 {
  // @Input (teoria cap. 18): il valore passato dal componente che USA la direttiva.
  // Qui il nome dell'Input coincide col nome della direttiva (pattern comune per
  // poter scrivere [appHighLigth1]="colore" invece di un attributo separato)
  @Input() appHighLigth1 = '';
  @Input() defaultColor = '';

  // ElementRef iniettato via costruttore: riferimento diretto all'elemento DOM
  // su cui e' applicata la direttiva
  constructor(private element: ElementRef) {
  }
  // @HostListener (teoria cap. 16): ascolta un evento DOM (mouseenter/mouseleave)
  // sull'elemento HOST (quello su cui e' messa la direttiva), senza bisogno di
  // (mouseenter) nel template di chi la usa
  @HostListener('mouseenter') onMouseEnter() {
    this.cambioColore(this.appHighLigth1);
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.cambioColore(this.defaultColor);
  }
  private cambioColore(colore: string) {
    this.element.nativeElement.style.backgroundColor = colore;
  }

}
