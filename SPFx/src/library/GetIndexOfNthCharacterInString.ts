/**
* Gets the index of a given search text in a string
*
* @param queryText The text to search in
* @param searchCharacter The text to search the string for
* @param nthNumber The occurrence offset of the search text in the string. If empty, this will be set to 1
*/
export function getIndexOfNthCharacterInString(
  queryText: string,
  searchCharacter: string,
  nthNumber?: number
): number {
  try {
    if (!nthNumber) nthNumber = 1;

    let offset: number = queryText.indexOf(searchCharacter);

    for (let i: number = 1; i < nthNumber; i++) {
      offset = queryText.indexOf(searchCharacter, offset + 1);
    }

    return offset;
  } catch {
    return 0;
  }
}
