/* eslint-disable @microsoft/spfx/no-async-await */
import { ServiceKey } from "@microsoft/sp-core-library";
import { HttpClient, HttpClientResponse, IHttpClientOptions } from '@microsoft/sp-http';
import { ListViewCommandSetContext, RowAccessor } from "@microsoft/sp-listview-extensibility";
import { IFlowRequestBody, IFlowResponse, ISelectedItem, isTriggerConfigValid, ITriggerConfig } from "../models";

export interface IFlowService {
  invokeFlow(context: ListViewCommandSetContext, triggerConfig: ITriggerConfig, selectedItems: readonly RowAccessor[]): Promise<IFlowResponse>;
}

export class FlowService implements IFlowService {

  public invokeFlow = async (context: ListViewCommandSetContext, triggerConfig: ITriggerConfig, selectedItems: readonly RowAccessor[]): Promise<IFlowResponse> => {
    try {
      if (!isTriggerConfigValid(triggerConfig)) {
        throw new Error("Flow configuration is invalid.");
      }

      switch (triggerConfig.httpMethod) {
        case 'GET':
          const httpClientGetOptions: IHttpClientOptions = this._createHttpClientGetOptions();

          if (!httpClientGetOptions) {
            throw new Error("HTTP client options are invalid.");
          }
          return await context.httpClient.get(triggerConfig.triggerUrl, HttpClient.configurations.v1, httpClientGetOptions)
            .then(async (response: HttpClientResponse): Promise<IFlowResponse> => {
              return {
                statusCode: response?.status,
                message: await this._tryGetMessageFromResponseBody(response)
              };
            });
        case 'POST':
          const httpClientPostOptions: IHttpClientOptions = this._createHttpClientPostOptions(context, selectedItems);

          if (!httpClientPostOptions) {
            throw new Error("HTTP client options are invalid.");
          }
          return await context.httpClient.post(triggerConfig.triggerUrl, HttpClient.configurations.v1, httpClientPostOptions)
            .then(async (response: HttpClientResponse): Promise<IFlowResponse> => {
              return {
                statusCode: response?.status,
                message: await this._tryGetMessageFromResponseBody(response)
              };
            });
        default:
          return null;
      }
    } catch (err) {
      return null;
    }
  }

  private _tryGetMessageFromResponseBody = async (response: HttpClientResponse): Promise<string> => {
    try {
      return await response?.json()?.then((result): Promise<string> => Promise.resolve(result?.message));
    } catch (err) {
      return null;
    }
  }

  private _createHttpClientPostOptions = (context: ListViewCommandSetContext, selectedItems: readonly RowAccessor[]): IHttpClientOptions => {
    try {
      const processedSelectedItems: ISelectedItem[] = [];

      selectedItems.forEach((selectedItem: RowAccessor): void => {
        const processedSelectedItem: ISelectedItem = {
          id: parseInt(selectedItem?.getValueByName("ID")),
          fileRef: selectedItem?.getValueByName("FileRef"),
          fileLeafRef: selectedItem?.getValueByName("FileLeafRef"),
          fileType: selectedItem?.getValueByName("File_x0020_Type"),
          uniqueIdentifier: selectedItem?.getValueByName("UniqueId")
        };
        processedSelectedItems.push(processedSelectedItem);
      });

      const requestHeaders: Headers = new Headers();
      requestHeaders.append('Content-type', 'application/json');
      requestHeaders.append('Cache-Control', 'no-cache');

      const requestBody: IFlowRequestBody = {
        site: context.pageContext.site.absoluteUrl,
        tenantUrl: context.pageContext.legacyPageContext?.portalUrl,
        listId: context.pageContext.list?.id.toString(),
        culture: context.pageContext.cultureInfo.currentUICultureName,
        selectedItems: processedSelectedItems
      };

      const httpClientOptions: IHttpClientOptions = {
        body: JSON.stringify(requestBody),
        headers: requestHeaders
      };

      return httpClientOptions;
    } catch (err) {
      return null;
    }
  }

  private _createHttpClientGetOptions = (): IHttpClientOptions => {
    try {
      const requestHeaders: Headers = new Headers();
      requestHeaders.append('Content-type', 'application/json');
      requestHeaders.append('Cache-Control', 'no-cache');

      const httpClientOptions: IHttpClientOptions = {
        body: null,
        headers: requestHeaders
      };

      return httpClientOptions;
    } catch (err) {
      return null;
    }
  }
}

export const FlowServiceKey: ServiceKey<IFlowService> = ServiceKey.create<IFlowService>(
  "FlowService:FlowService",
  FlowService
);
