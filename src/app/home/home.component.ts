
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { animations } from '../animation';

@Component({
    selector: 'app-home',
    imports: [],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    animations: animations
})
export class HomeComponent {
}