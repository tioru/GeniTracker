import { Component, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  imports: [],
  selector: 'app-character',
  styleUrl: './character.component.scss',
  templateUrl: './character.component.html',
})
export class CharacterComponent {
  private transloco = inject(TranslocoService);
}
