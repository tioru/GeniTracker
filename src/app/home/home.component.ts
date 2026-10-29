
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'app-home',
    imports: [TranslocoDirective],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class HomeComponent {

    private transloco = inject(TranslocoService);

    
}