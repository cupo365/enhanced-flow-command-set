import { Log } from "@microsoft/sp-core-library";
import { RowAccessor } from "@microsoft/sp-listview-extensibility";
import { getIndexOfNthCharacterInString, getUrlParameterByName } from ".";
import { LOG_SOURCE } from "../extensions/enhancedPowerAutomateTrigger/util";

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
    Log.error(LOG_SOURCE, err);
    return false;
  }
}
