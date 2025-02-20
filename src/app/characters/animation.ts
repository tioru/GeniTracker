import { trigger, style, animate, transition } from '@angular/animations';

export const animations = [
    trigger('fadeText', [
        transition(':leave', [
          animate('300ms ease-out', style({ opacity: 0 }))
        ]),
        transition(':enter', [ // Animation for fading in
          style({ opacity: 0 }),
          animate('300ms ease-in', style({ opacity: 0.75 }))
        ])
    ])
];