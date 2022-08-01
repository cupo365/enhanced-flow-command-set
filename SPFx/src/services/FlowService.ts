/* eslint-disable @microsoft/spfx/no-async-await */
import { ServiceKey } from "@microsoft/sp-core-library";
import { HttpClient, HttpClientResponse, IHttpClientOptions } from '@microsoft/sp-http';
import { ListViewCommandSetContext, RowAccessor } from "@microsoft/sp-listview-extensibility";
import { Logger } from "@pnp/logging";
import { IFlowRequestBody, IFlowResponse, ISelectedItem, isTriggerConfigValid, ITriggerConfig } from "../models";

export interface IFlowService {
  invokeFlow(context: ListViewCommandSetContext, triggerConfig: ITriggerConfig, selectedItems: readonly RowAccessor[]): Promise<IFlowResponse>;
}

export class FlowService implements IFlowService {

  /**
  * Invokes a flow with an HTTP request using the webpart's HTTP client
  * and returns the flow response
  *
  * @param context The webpart context
  * @param triggerConfig The trigger config with which to trigger the flow
  * @param selectedItems The selected list items
  */
  public invokeFlow = async (context: ListViewCommandSetContext, triggerConfig: ITriggerConfig,
    selectedItems: readonly RowAccessor[]): Promise<IFlowResponse> => {
    try {
      if (!isTriggerConfigValid(triggerConfig)) {
        throw new Error("Flow configuration is invalid.");
      }

      // Send request based on configured HTTP method
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
      Logger.error(err);
      return null;
    }
  }

  /**
  * Attempts to fetch a message from the response body. If one is not present,
  * an empty string is returned
  *
  * @param response The flow response object
  */
  private _tryGetMessageFromResponseBody = async (response: HttpClientResponse): Promise<string> => {
    try {
      return await response?.json()?.then((result): Promise<string> => Promise.resolve(result?.message));
    } catch (err) {
      Logger.error(err);
      return null;
    }
  }

  /**
  * Composes the request body and headers to invoke a flow with an HTTP POST request
  *
  * @param context The webpart context
  * @param selectedItems The selected list items
  */
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
      Logger.error(err);
      return null;
    }
  }

  /**
  * Composes the request body and headers to invoke a flow with an HTTP GET request
  */
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
      Logger.error(err);
      return null;
    }
  }
}

/**
* Creates a service key for the FlowService class, which can be used for dependency injection
*/
export const FlowServiceKey: ServiceKey<IFlowService> = ServiceKey.create<IFlowService>(
  "FlowService:FlowService",
  FlowService
);
