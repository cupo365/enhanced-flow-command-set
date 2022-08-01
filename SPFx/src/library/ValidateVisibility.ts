import { RowAccessor } from "@microsoft/sp-listview-extensibility";
import { Logger } from "@pnp/logging";
import { getIndexOfNthCharacterInString, getUrlParameterByName } from ".";

/**
* Determines the visibility of the command set and flow buttons,
by validating the whitelist and blacklist rules of a given trigger configuration
*
* @param fileExtensionBlacklist The blacklisted file extension(s) for the flow trigger. If empty, all file extensions will be allowed
* @param contentTypeBlacklist The blacklisted content type(s) for the flow trigger. If empty, all content types will be allowed
* @param listWhitelist The whitelisted list(s) for the flow trigger. If empty, all lists will be allowed
* @param folderWhitelist The whitelisted folder path(s) for the flow trigger. If empty, all folder paths will be allowed
* @param maxSelectionLimit The max amount of selected list items for the flow trigger
* @param selectedItems The selected list items
* @param currentListId The GUID of the current list
*/
export const validateVisibility = (fileExtensionBlacklist: string[] | undefined, contentTypeBlacklist: string[] | undefined,
  listWhitelist: string[] | undefined, folderWhitelist: string[] | undefined,
  maxSelectionLimit: number, selectedItems: readonly RowAccessor[], currentListId: string | undefined): boolean => {
  try {
    const containsBlacklistedFileExtensions: boolean = fileExtensionBlacklist ? selectedItems.map((selectedItem) => {
      return fileExtensionBlacklist.map((blackListedFileExtension) =>
        selectedItem.getValueByName("FileLeafRef").toLowerCase().split('.').pop() === blackListedFileExtension.toLowerCase()).includes(true);
    }).includes(true) : false;

    const containsBlacklistedContentTypes: boolean = contentTypeBlacklist ? selectedItems.map((selectedItem) => {
      return contentTypeBlacklist.map((blackListedContentType) =>
        selectedItem.getValueByName("ContentTypeId").toLowerCase()
          .startsWith(blackListedContentType.toLowerCase())).includes(true);
    }).includes(true) : false;

    const isWhitelistedList: boolean = listWhitelist && currentListId ?
      listWhitelist.includes(currentListId) : !listWhitelist;

    const serverRelativePath: string = getUrlParameterByName("id");
    const listRelativePath: string = serverRelativePath ? serverRelativePath.substring(
      getIndexOfNthCharacterInString(serverRelativePath, '/', 4) + 1, serverRelativePath.length) : undefined;

    const isWhitelistedFolderPath: boolean = folderWhitelist && listRelativePath ? folderWhitelist.some((a) => {
      if (a.charAt(0) === '/' || a.charAt(0) === "\\") {
        return listRelativePath.startsWith(a.substring(1, a.length));
      } else {
        return listRelativePath.startsWith(a);
      }
    }) : !folderWhitelist;

    const isWithinSelectionLimit: boolean = maxSelectionLimit === 1 ? selectedItems.length === 1
      : selectedItems.length >= 1 && selectedItems.length <= maxSelectionLimit;

    const validationResult: boolean = isWhitelistedList && isWhitelistedFolderPath && !containsBlacklistedContentTypes
      && !containsBlacklistedFileExtensions && isWithinSelectionLimit;

    return validationResult;
  } catch (err) {
    Logger.error(err);
    return false;
  }
}
