import { animate, state, style, transition, trigger } from "@angular/animations";

export const FADE_DURATION = 200;

export const animations = [
  trigger('fadeDialog', [
    transition('false => true', [
      style({ opacity: 0 }),
      animate(`${FADE_DURATION}ms ease-in`, style({ opacity: 1 }))
    ]),

    transition('true => false', [
      style({ opacity: 1 }),
      animate(`${FADE_DURATION}ms ease-out`, style({ opacity: 0 }))
    ]),

    state('true', style({ opacity: 1 })),
    state('false', style({ opacity: 0 }))
  ])
];