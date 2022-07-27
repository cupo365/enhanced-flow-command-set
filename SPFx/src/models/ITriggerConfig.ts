import { stringIsNullOrEmpty } from "../util";

export interface ITriggerConfig {
  title: string;
  triggerUrl: string;
  httpMethod: string;
  listWhitelist: string[] | undefined;
  folderWhitelist: string[] | undefined;
  contentTypeBlacklist: string[] | undefined;
  fileExtensionBlacklist: string[] | undefined;
  selectionLimit: number;
}

export const isTriggerConfigValid = (triggerConfig: ITriggerConfig): boolean => {
  try {
    if (triggerConfig && !stringIsNullOrEmpty(triggerConfig?.title) && !stringIsNullOrEmpty(triggerConfig?.triggerUrl)
      && !stringIsNullOrEmpty(triggerConfig?.httpMethod) && !isNaN(triggerConfig?.selectionLimit)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};
