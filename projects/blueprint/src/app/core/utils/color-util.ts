import { scaleOrdinal } from 'd3';
import { COLORS, DEFAULT_COLOR } from '@blueprint/constant/color';

class _ColorUtil {
  private readonly _colors = COLORS;
  private readonly _undefColor = DEFAULT_COLOR;
  private readonly _indexedColorScheme: (colorIndex: number) => string;
  private readonly _numberOfColors = this._colors.length;

  constructor() {
    this._indexedColorScheme = scaleOrdinal(this._colors).domain([
      ...Array(this._colors.length).keys(),
    ]);
  }

  getColorForIndex(index: number): string {
    if (index && +index >= 0) {
      return this._indexedColorScheme(+index % this._numberOfColors);
    }
    return this._undefColor;
  }

  getColorForIndexString(stringIndex: string): string {
    const index = Number(stringIndex);
    if (index && +index >= 0) {
      return this._indexedColorScheme(+index % this._numberOfColors);
    }
    return this._undefColor;
  }


}

export const ColorUtil = new _ColorUtil();