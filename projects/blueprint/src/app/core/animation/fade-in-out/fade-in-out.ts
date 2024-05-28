import { animate, style, transition, trigger } from '@angular/animations';

// Define the fadeInOut animation
export const fadeInOut = [
  trigger('fade', [
    // Define the void => * transition
    transition('void => *', [
      style({ opacity: 0 }), // Set the initial opacity to 0
      animate(150) // Fade in over x milliseconds
    ]),
    // Define the * => void transition
    transition('* => void', [
      style({ opacity: 1 }), // Set the initial opacity to 1
      animate(150) // Fade out over x milliseconds
    ]),
  ]),
];

// Define the fadeInOut animation
export const fadeIn = [
  trigger('fadeIn', [
    // Define the void => * transition
    transition('void => *', [
      style({ opacity: 0 }), // Set the initial opacity to 0
      animate(150) // Fade in over x milliseconds
    ]),
    // Define the * => void transition
    /*
    transition('* => void', [
      style({ opacity: 1 }), // Set the initial opacity to 1
      animate(150) // Fade out over x milliseconds
    ]),
    */
  ]),
];