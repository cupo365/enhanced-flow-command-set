import { ServiceKey } from "@microsoft/sp-core-library";
import { Web } from "@pnp/sp";
import { IFlowConfig, isFlowConfigValid, IListItemResponse } from "../models";

export interface ISPOService {
  getFlowConfig(rootUrl: string, listTitle: string): Promise<IFlowConfig[]>;
}

export default class SPOService implements ISPOService {
  constructor() {}

  public getFlowConfig = async (rootUrl: string, listTitle: string): Promise<IFlowConfig[]> => {
      try {
        return await new Web(rootUrl).lists.getByTitle(listTitle).items.getAll()
          .then((response: IListItemResponse[]) => {
            return new Promise((resolve, reject) => {
              let flowConfigs: IFlowConfig[] = JSON.parse(response[response?.length - 1]?.Flows);
              flowConfigs.forEach((flowConfig: IFlowConfig) => {
                if (!isFlowConfigValid(flowConfig)) {
                  throw new Error(`Flow configuration for '${flowConfig.actionName}' is invalid.`);
                }
              });
              resolve(flowConfigs);
            });
          });
      }
    catch(ex) {
      return null;
    }
  }
}

export const SPOServiceKey = ServiceKey.create<ISPOService>(
  "SPOService:SPOService",
  SPOService
);
