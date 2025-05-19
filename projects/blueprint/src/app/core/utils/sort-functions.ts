
export function sortStrings(a: string, b: string): number {
  // create an array sort with localeCompare
  return a.localeCompare(b);
}

export function labelAlphaSort(a: ObjectWithLabel, b: ObjectWithLabel): number {
  const aLabel = a.label ?? '';
  const bLabel = b.label ?? '';
  const aNum = Number(aLabel);
  const bNum = Number(bLabel);

  const aIsNum = !isNaN(aNum);
  const bIsNum = !isNaN(bNum);

  if (aIsNum && bIsNum) {
    return aNum - bNum;
  } else if (!aIsNum && !bIsNum) {
    return aLabel.localeCompare(bLabel, undefined, { sensitivity: 'base' });
  } else {
    // Numbers come before strings
    return aIsNum ? -1 : 1;
  }

}

interface ObjectWithLabel {
  label: string;
}
