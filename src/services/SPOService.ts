/* eslint-disable @microsoft/spfx/no-async-await */
import { ServiceKey } from "@microsoft/sp-core-library";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/items/get-all";
import { IFlowConfig, isFlowConfigValid } from "../models";
import { getSP } from "./PnPService";

export interface ISPOService {
  getFlowConfig(listTitle: string): Promise<IFlowConfig[]>;
}

export class SPOService implements ISPOService {
  private readonly _sp: SPFI;

  public constructor() {
    this._sp = getSP();
  }

  public getFlowConfig = async (
    listTitle: string
  ): Promise<IFlowConfig[]> => {
    try {
      return await this._sp.web.lists
        .getByTitle(listTitle)
        .items.getAll()
        .then((response): Promise<IFlowConfig[]> => {
          return new Promise((resolve, reject): void => {
            const flowConfigs: IFlowConfig[] = [];

            response.forEach((triggerConfigListItem): void => {
              const flowConfig: IFlowConfig = {
                actionName: triggerConfigListItem?.Title,
                url: triggerConfigListItem?.TriggerURL,
                method: triggerConfigListItem?.HTTPType
              };

              if (!isFlowConfigValid(flowConfig)) {
                throw new Error(`Flow configuration for '${flowConfig.actionName}' is invalid.`);
              }

              flowConfigs.push(flowConfig);
            });
            resolve(flowConfigs);
          });
        });
    } catch (err) {
      return null;
    }
  }
}

export const SPOServiceKey: ServiceKey<ISPOService> = ServiceKey.create<ISPOService>(
  "SPOService:SPOService",
  SPOService
);
