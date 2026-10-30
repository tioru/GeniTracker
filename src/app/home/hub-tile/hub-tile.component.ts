import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HubTile } from './hub-tile';

@Component({
  imports: [RouterLink],
  selector: 'app-hub-tile',
  styleUrl: './hub-tile.component.scss',
  templateUrl: './hub-tile.component.html',
})
export class HubTileComponent {
  tile = input.required<HubTile>();
  index = input(0);
  sub = input<string>('');
  roman = computed(() => ['I','II','III','IV','V','VI','VII','VIII','IX','X'][this.index()]);
}
