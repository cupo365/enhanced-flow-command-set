/**
* Checks if a string starts with a least one of a given subset or substrings
*
* @param str The string to check
* @param substrs The set of substring to check for
*/
export function checkIfStringStartsWith(str: string, substrs: string[]): boolean {
  return substrs.some((substr: string): boolean => str.startsWith(substr));
}
