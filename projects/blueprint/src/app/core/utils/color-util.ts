import { COLORS, DEFAULT_COLOR } from '@blueprint/constant/color';

class _ColorUtil {
  readonly #colors = COLORS;
  readonly #undefinedColor = DEFAULT_COLOR;


  getColorForIndex(index: number): string {
    // retun the color for the index
    if (index > this.#colors.length - 1) {
      return this.#undefinedColor;
    }

    if (index < 0) {
      return this.#undefinedColor;
    }
    return this.#colors[index];

  }

  getColorForIndexString(stringIndex: string): string {
    const index = Number(stringIndex);
    if (isNaN(index)) {
      return this.#undefinedColor;
    }
    return this.getColorForIndex(index);
  }

}

export const ColorUtil = new _ColorUtil();