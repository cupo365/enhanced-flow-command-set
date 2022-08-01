/**
* Gets the value of a parameter in a URL
*
* @param name The name of the parameter to fetch the value for
*/
export function getUrlParameterByName(name: string): string {
  const url: string = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regexString: string = "[?&]" + name + "(=([^&#]*)|&|#|$)";
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp
  const regex: RegExp = new RegExp(regexString),
    results: RegExpExecArray = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
