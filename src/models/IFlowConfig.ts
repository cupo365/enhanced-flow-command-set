import { stringIsNullOrEmpty } from "@pnp/pnpjs";

export interface IFlowConfig {
  actionName: string;
  url: string;
  method: string;
}

export const isFlowConfigValid = (flowConfig: IFlowConfig): boolean => {
  try {
    if (flowConfig && !stringIsNullOrEmpty(flowConfig?.actionName)
      && !stringIsNullOrEmpty(flowConfig?.url) && !stringIsNullOrEmpty(flowConfig?.method)) {
      return true;
    } else {
      return false;
    }
  } catch (ex) {
    return false;
  }
};
