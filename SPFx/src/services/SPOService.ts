/* eslint-disable @microsoft/spfx/no-async-await */
import { ServiceKey } from "@microsoft/sp-core-library";
import { Logger } from "@pnp/logging";
import { SPFI } from "@pnp/sp";
import * as AppSettings from "AppSettings";
import { getSP } from "../middleware";
import { isTriggerConfigValid, ITriggerConfig } from "../models";

export interface ISPOService {
  getTriggerConfig(): Promise<ITriggerConfig[]>;
  getConfigListTitle(): string;
}

export class SPOService implements ISPOService {
  private readonly _sp: SPFI;
  private readonly _configListTitle: string;

  public constructor() {
    this._sp = getSP();
    this._configListTitle = AppSettings.ConfigListTitle
  }

  /**
  * Getter for the private class variable _configListTitle
  */
  public getConfigListTitle(): string {
    return this._configListTitle;
  }

  /**
  * Fetches the trigger configuration from the SharePoint config list.
  * Which list the function fetches the config from is determined by the AppSettings
  */
  public getTriggerConfig = async (): Promise<ITriggerConfig[]> => {
    try {
      if (!this._sp) {
        throw new Error("Context is invalid.");
      }

      if (!this._configListTitle) {
        throw new Error("Trigger config list title is invalid.");
      }

      const flowLimit: number = AppSettings.FlowButtonDisplayLimit;

      return await this._sp.web.lists
        .getByTitle(this._configListTitle)
        .items.top(flowLimit)()
        .then((response): Promise<ITriggerConfig[]> => {
          return new Promise((resolve, reject): void => {
            const flowConfigs: ITriggerConfig[] = [];

            response.forEach((triggerConfigListItem): void => {
              try {
                const flowConfig: ITriggerConfig = {
                  title: triggerConfigListItem?.Title,
                  triggerUrl: triggerConfigListItem?.TriggerURL,
                  httpMethod: triggerConfigListItem?.HTTPType,
                  originSecret: triggerConfigListItem?.OriginSecret,
                  listWhitelist: triggerConfigListItem?.ListWhitelist,
                  folderWhitelist: triggerConfigListItem?.FolderWhitelist,
                  contentTypeBlacklist: triggerConfigListItem?.ContentTypeBlacklist,
                  fileExtensionBlacklist: triggerConfigListItem?.FileExtensionBlacklist,
                  selectionLimit: triggerConfigListItem?.SelectionLimit,
                  requestedUserInput: triggerConfigListItem?.RequestedUserInput ? JSON.parse(triggerConfigListItem?.RequestedUserInput) : undefined
                };

                if (!isTriggerConfigValid(flowConfig)) {
                  throw new Error(`Flow configuration for '${flowConfig.title}' is invalid.`);
                } else {
                  flowConfigs.push(flowConfig);
                }
              }
              catch (err) {
                Logger.error(err);
              }
            });
            resolve(flowConfigs);
          });
        });
    } catch (err) {
      Logger.error(err);
      return null
    }
  }
}

/**
* Creates a service key for the SPOService class, which can be used for dependency injection
*/
export const SPOServiceKey: ServiceKey<ISPOService> = ServiceKey.create<ISPOService>(
  "SPOService:SPOService",
  SPOService
);
