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
  ])
];