/* eslint-disable @microsoft/spfx/no-async-await */
import { Log, ServiceKey } from "@microsoft/sp-core-library";
import { SPFI } from "@pnp/sp";
import { LOG_SOURCE } from "../extensions/enhancedPowerAutomateTrigger/util";
import { isTriggerConfigValid, ITriggerConfig } from "../models";
import { getSP } from "./PnPService";

export interface ISPOService {
  getTriggerConfig(listTitle: string): Promise<ITriggerConfig[]>;
}

export class SPOService implements ISPOService {
  private readonly _sp: SPFI;

  public constructor() {
    this._sp = getSP();
  }

  public getTriggerConfig = async (
    listTitle: string
  ): Promise<ITriggerConfig[]> => {
    try {
      return await this._sp.web.lists
        .getByTitle(listTitle)
        .items.getAll()
        .then((response): Promise<ITriggerConfig[]> => {
          return new Promise((resolve, reject): void => {
            const flowConfigs: ITriggerConfig[] = [];

            response.forEach((triggerConfigListItem): void => {
              const flowConfig: ITriggerConfig = {
                title: triggerConfigListItem?.Title,
                triggerUrl: triggerConfigListItem?.TriggerURL,
                httpMethod: triggerConfigListItem?.HTTPType,
                listWhitelist: triggerConfigListItem?.ListWhitelist,
                folderWhitelist: triggerConfigListItem?.FolderWhitelist,
                contentTypeBlacklist: triggerConfigListItem?.ContentTypeBlacklist,
                fileExtensionBlacklist: triggerConfigListItem?.FileExtensionBlacklist,
                selectionLimit: triggerConfigListItem?.SelectionLimit
              };

              if (!isTriggerConfigValid(flowConfig)) {
                Log.warn(LOG_SOURCE, `Flow configuration for '${flowConfig.title}' is invalid.`);
              } else {
                flowConfigs.push(flowConfig);
              }
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
