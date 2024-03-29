/**
* Validates whether a string is null or empty
*
* @param str The string to validate
*/
export function stringIsNullOrEmpty(str: string): boolean {
  try {
    if (typeof str === 'string' && str.length > 0) {
      return false;
    }

    return true;
  } catch (err) {
    return true;
  }
}
