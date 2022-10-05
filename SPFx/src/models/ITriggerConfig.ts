import { IRequestedUserInput, isRequestedUserInputValid } from ".";
import { stringIsNullOrEmpty } from "../library";

export interface ITriggerConfig {
  title: string;
  triggerUrl: string;
  httpMethod: string;
  originSecret: string | undefined;
  listWhitelist: string[] | undefined;
  folderWhitelist: string[] | undefined;
  contentTypeBlacklist: string[] | undefined;
  fileExtensionBlacklist: string[] | undefined;
  selectionLimit: number;
  requestedUserInput: Array<IRequestedUserInput> | undefined;
}

/**
* Validates a trigger configuration object.
* @param triggerConfig The trigger configuration object to validate.
*/
export const isTriggerConfigValid = (triggerConfig: ITriggerConfig): boolean => {
  try {
    if (triggerConfig && !stringIsNullOrEmpty(triggerConfig?.title) && !stringIsNullOrEmpty(triggerConfig?.triggerUrl)
      && !stringIsNullOrEmpty(triggerConfig?.httpMethod) && !isNaN(triggerConfig?.selectionLimit)) {
      if (triggerConfig?.requestedUserInput && triggerConfig?.requestedUserInput.length > 0) {
        return triggerConfig?.requestedUserInput.every((requestedUserInput: IRequestedUserInput): boolean => {
          if (triggerConfig.requestedUserInput.filter(x => x.name === requestedUserInput.name).length > 1) {
            throw new Error(`EnhancedFlowTrigger -> Trigger configuration for '${triggerConfig?.title}' is invalid.`);
          }
          return isRequestedUserInputValid(requestedUserInput, triggerConfig.title);
        });
      } else return true;
    } else {
      throw new Error(`EnhancedFlowTrigger -> Trigger configuration for '${triggerConfig?.title}' is invalid.`);
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};
