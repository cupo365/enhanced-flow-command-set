let _logSource: string = null;

/**
* Getter and setter for the log source global variable
*
* @param logSource If set, the log source will be set to this value and gets returned.
If empty, the log source value will be returned
*/
export const getLogSource = (logSource?: string): string => {
  if (_logSource === null && logSource !== undefined) {
    _logSource = logSource;
  } else if (_logSource !== null && logSource !== undefined && _logSource !== logSource) {
    _logSource = logSource;
  }
  return _logSource;
}
