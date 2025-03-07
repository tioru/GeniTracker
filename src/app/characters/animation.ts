import { trigger, style, animate, transition, state } from '@angular/animations';

export const animations = [
  trigger('hover', [
    state('false', style({
      transform: 'scale(1)',
    })),
    state('true', style({
      transform: 'scale(1.03)',
    })),
    transition('true <=> false', [
      animate('200ms ease-out')
    ])
  ]),
  trigger('enter-leave', [
    transition(':enter', [
      style({
        transform: 'scale(0.5)',
        opacity: '0'
      }),
      animate('200ms ease-out', 
        style({
          transform: 'scale(1)',
          opacity: '1'
        })
      )
    ]),
    transition(':leave', [
      animate('200ms ease-out', 
        style({
          transform: 'scale(0.5)',
          opacity: '0'
        })
      )
    ])
  ])
];