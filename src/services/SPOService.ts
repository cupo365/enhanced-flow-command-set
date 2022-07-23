import { ServiceKey } from "@microsoft/sp-core-library";
import { Web } from "@pnp/sp";
import { IFlowConfig, isFlowConfigValid } from "../models";

export interface ISPOService {
  getFlowConfig(siteUrl: string, listTitle: string): Promise<IFlowConfig[]>;
}

export class SPOService implements ISPOService {
  constructor() { }

  public getFlowConfig = async (
    siteUrl: string,
    listTitle: string
  ): Promise<IFlowConfig[]> => {
    try {
      return await new Web(siteUrl).lists
        .getByTitle(listTitle)
        .items.getAll()
        .then((response: any[]): Promise<IFlowConfig[]> => {
          return new Promise((resolve, reject): void => {
            let flowConfigs: IFlowConfig[] = [];

            response.forEach((triggerConfigListItem: any): void => {
              let flowConfig: IFlowConfig = {
                actionName: triggerConfigListItem?.Title,
                url: triggerConfigListItem?.TriggerURL,
                method: triggerConfigListItem?.HTTPType
              };

              if (!isFlowConfigValid(flowConfig)) {
                throw `Flow configuration for '${flowConfig.actionName}' is invalid.`;
              }

              flowConfigs.push(flowConfig);
            });
            resolve(flowConfigs);
          });
        });
    } catch (ex) {
      return null;
    }
  }
}

export const SPOServiceKey = ServiceKey.create<ISPOService>(
  "SPOService:SPOService",
  SPOService
);
