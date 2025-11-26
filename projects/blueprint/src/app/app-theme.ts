import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import {palette} from '@primeuix/themes';

export const AuraSky = definePreset(Aura, {
  semantic: {
    primary: palette('{sky}')
  }
});