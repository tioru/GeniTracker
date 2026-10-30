
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { HUB_TILES } from './hub-tile/hub-tile';
import { HubTileComponent } from './hub-tile/hub-tile.component';

@Component({
    selector: 'app-home',
    imports: [TranslocoDirective, HubTileComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class HomeComponent {

    private transloco = inject(TranslocoService);

    public tiles = HUB_TILES;

    public subs = signal<Record<string, string>>({});
}