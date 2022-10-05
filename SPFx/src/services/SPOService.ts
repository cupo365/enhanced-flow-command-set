/* eslint-disable @microsoft/spfx/no-async-await */
import { IDropdownOption } from "@fluentui/react";
import { ServiceKey } from "@microsoft/sp-core-library";
import { Logger } from "@pnp/logging";
import { SPFI } from "@pnp/sp";
import * as AppSettings from "AppSettings";
import { getSP } from "../middleware";
import { IRequestedUserInput, isTriggerConfigValid, ITriggerConfig, SupportedInputTypes } from "../models";

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
          return Promise.all(response.map(async (triggerConfigListItem) => {
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
              } else if (flowConfig.requestedUserInput) {
                return await this._processRequestedUserInput(flowConfig.requestedUserInput).then((processedRequestedInput: IRequestedUserInput[]) => {
                  flowConfig.requestedUserInput = processedRequestedInput;
                  return Promise.resolve(flowConfig);
                });
              } else {
                return Promise.resolve(flowConfig);
              }
            }
            catch (err) {
              Logger.error(err);
              return Promise.reject();
            }
          }));
        });
    } catch (err) {
      Logger.error(err);
      return Promise.reject(null);
    }
  }

  /**
  * Processes the requested user input fields for the flow trigger.
  * @param requestedUserInput The requested user input fields for the flow trigger.
  */
  private _processRequestedUserInput = async (requestedUserInput: IRequestedUserInput[]): Promise<IRequestedUserInput[]> => {
    try {
      return await Promise.all(requestedUserInput.map(async (requestedInput: IRequestedUserInput): Promise<IRequestedUserInput> => {
        if (requestedInput.type === SupportedInputTypes.Lookup || requestedInput.type === SupportedInputTypes.MultiLookup) {
          return await this._getLookupOptions(requestedInput.lookupListName, requestedInput.lookupDisplayColumn).then((options: IDropdownOption[]) => {
            const processedRequestedInput: IRequestedUserInput = requestedInput;
            processedRequestedInput.options = options;
            return Promise.resolve(processedRequestedInput);
          });
        } else {
          return Promise.resolve(requestedInput);
        }
      }));
    } catch (err) {
      Logger.error(err);
      return Promise.reject(requestedUserInput);
    }
  }

  /**
  * Fetches the lookup options for the requested user input for the flow trigger.
  * @param list The list to fetch the lookup options from.
  * @param displayField The column of the lookup list to display in the option set.
  */
  private _getLookupOptions = async (list: string, displayField: string): Promise<IDropdownOption[]> => {
    try {
      if (!this._sp) {
        throw new Error("Context is invalid.");
      }

      return await this._sp.web.lists
        .getByTitle(list)
        .select(`Id, ${displayField}`)
        .items()
        .then((response): Promise<IDropdownOption[]> => {
          return new Promise((resolve, reject): void => {
            const lookupOptions: IDropdownOption[] = [];

            response.forEach((item): void => {
              try {
                const lookupOption: IDropdownOption = {
                  key: item.Id,
                  text: item[displayField].toString()
                };

                lookupOptions.push(lookupOption);
              }
              catch (err) {
                Logger.error(err);
              }
            });
            resolve(lookupOptions);
          });
        });

    } catch (err) {
      Logger.error(err);
      console.log(`EnhancedFlowTrigger -> Could not fetch lookup options for list '${list}'.`);
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
