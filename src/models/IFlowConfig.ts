import { stringIsNullOrEmpty } from "@pnp/pnpjs";
import { isTriggerConfigValid, ITriggerConfig } from "./ITriggerConfig";

export interface IFlowConfig {
  actionName?: string;
  trigger?: ITriggerConfig;
}

export const isFlowConfigValid = (flowConfig: IFlowConfig): boolean => {
  try {
    if (flowConfig && !stringIsNullOrEmpty(flowConfig?.actionName)
          && isTriggerConfigValid(flowConfig?.trigger)) {
      return true;
    } else {
      return false;
    }
  } catch (ex) {
    return false;
  }
};
