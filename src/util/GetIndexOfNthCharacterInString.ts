export function getIndexOfNthCharacterInString(
  queryText: string,
  searchCharacter: string,
  nthNumber: number
): number {
  try {
    let offset: number = queryText.indexOf(searchCharacter);

    for (let i: number = 1; i < nthNumber; i++) {
      offset = queryText.indexOf(searchCharacter, offset + 1);
    }

    return offset;
  } catch {
    return 0;
  }
}
