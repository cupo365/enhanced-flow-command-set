import { stringIsNullOrEmpty } from "@pnp/pnpjs";

export interface ITriggerConfig {
  url: string;
  method: string;
}

export const isTriggerConfigValid = (triggerConfig: ITriggerConfig): boolean => {
  try {
    if (triggerConfig && !stringIsNullOrEmpty(triggerConfig?.url) && !stringIsNullOrEmpty(triggerConfig.method)) {
      return true;
    } else {
      return false;
    }
  } catch (ex) {
    return false;
  }
};
