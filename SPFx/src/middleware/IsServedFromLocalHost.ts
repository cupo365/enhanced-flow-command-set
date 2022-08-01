let _servedFromLocalHost: boolean = null;

/**
* Getter and setter for the served from localhost global variable
*
* @param servedFromLocalHost If set, the served from localhost will be set to this value and gets returned.
If empty, the served from localhost value will be returned
*/
export const isServedFromLocalHost = (servedFromLocalHost?: boolean): boolean => {
  if (_servedFromLocalHost === null && servedFromLocalHost !== undefined) {
    _servedFromLocalHost = servedFromLocalHost;
  } else if (_servedFromLocalHost !== null && servedFromLocalHost !== undefined && _servedFromLocalHost !== servedFromLocalHost) {
    _servedFromLocalHost = servedFromLocalHost;
  }
  return _servedFromLocalHost;
}
