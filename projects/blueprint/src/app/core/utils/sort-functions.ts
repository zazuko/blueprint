
export function sortStrings(a: string, b: string): number {
  // create an array sort with localeCompare
  return a.localeCompare(b);
}

export function labelAlphaSort(a: ObjectWithLabel, b: ObjectWithLabel): number {
  return a.label.localeCompare(b.label);
}

interface ObjectWithLabel {
  label: string;
}
