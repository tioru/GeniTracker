import { Component, computed, input } from '@angular/core';
import { parseDescription } from '../../../utilities/talent-description';

@Component({
  imports: [],
  selector: 'app-talent-description',
  styleUrl: './talent-description.component.scss',
  templateUrl: './talent-description.component.html',
})
export class TalentDescriptionComponent {
  text = input<string | null>();
  blocks = computed(() => parseDescription(this.text()));
}
