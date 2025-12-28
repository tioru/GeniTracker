import { trigger, style, animate, transition, state, group, query } from '@angular/animations';

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
  ]),
  trigger('click', [
    state('false', style({
      transform: 'scale(1)',
    })),
    state('true', style({
      transform: 'scale(0.8)',
    })),
    transition('true <=> false', [
      animate('100ms ease-in-out')
    ])
  ]),
  trigger('slideAnimation', [
    transition(':enter', [
      style({ 
        opacity: 0, 
        transform: 'translateX(100%)' 
      }),
      animate('700ms ease', style({ 
        opacity: 1, 
        transform: 'translateX(0)' 
      }))
    ]),
    transition(':leave', [
      animate('500ms ease', style({ 
        opacity: 0, 
        transform: 'translateX(100%)' 
      }))
    ])
  ]),
  trigger('contentAnimation', [
      transition(':enter', [
        style({ height: 0, width: 0, opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', width: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', width: '*', opacity: 1, overflow: 'hidden' }),
        animate('300ms ease-in', style({ height: 0, width: 0, opacity: 0 }))
      ])
  ]),
  trigger('slideYAnimation', [
    transition(':enter', [
      style({ 
        opacity: 0, 
        transform: 'translateY(100%)' 
      }),
      animate('500ms ease', style({ 
        opacity: 1, 
        transform: 'translateY(0)' 
      }))
    ]),
    transition(':leave', [
      animate('500ms ease', style({ 
        opacity: 0, 
        transform: 'translateY(100%)' 
      }))
    ])
  ]),
  trigger('rotateArrow', [
    state('false', style({ transform: 'rotate(0deg)' })),
    state('true', style({ transform: 'rotate(180deg)' })),
    transition('false <=> true', animate('300ms ease-in-out'))
  ]),
  trigger('fade', [
    state('false', style({ opacity: 1, height: '*', width: '*', overflow: 'hidden'})),
    state('true', style({ opacity: 0, height: 0, width: 0, overflow: 'hidden'})),
    transition('false <=> true', animate('300ms ease-in-out'))
  ]),
  trigger('buttonResize', [
      state('expanded', style({
        width: '{{expandedWidth}}px'
      }), { params: { expandedWidth: 200 } }),
      state('reduced', style({
        width: '{{reducedWidth}}px'
      }), { params: { reducedWidth: 50 } }),
      transition('expanded <=> reduced', [
        animate('300ms ease-in-out')
      ])
    ]),
    trigger('crossfade', [
      transition('1 <=> 2', [
        group([
          query('.active', [
            style({ opacity: 0, scale: 0.7 })
          ]),
          query(':not(.active)', [
            animate('0.15s ease-out', 
            style({ opacity: 0, scale: 0.7 }))
          ]),
          query('.active', [
            animate('0.15s ease-in',
            style({ opacity: 1, scale: 1 }))
          ])
        ])
      ])
    ])
];