export function checkIfStringStartsWith(str: string, substrs: string[]): boolean {
  return substrs.some((substr: string): boolean => str.startsWith(substr));
}
