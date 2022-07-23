import { ServiceKey } from "@microsoft/sp-core-library";
import { HttpClient, HttpClientResponse, IHttpClientOptions } from '@microsoft/sp-http';
import { ListViewCommandSetContext, RowAccessor } from "@microsoft/sp-listview-extensibility";
import { IFlowConfig, IFlowRequestBody, IFlowResponse, ISelectedItem, isFlowConfigValid } from "../models";

export interface IFlowService {
  invokeFlow(context: ListViewCommandSetContext, flowConfig: IFlowConfig, selectedItems: readonly RowAccessor[]): Promise<IFlowResponse>;
}

export class FlowService implements IFlowService {
  constructor() { }

  public invokeFlow = async (context: ListViewCommandSetContext, flowConfig: IFlowConfig, selectedItems: readonly RowAccessor[]): Promise<IFlowResponse> => {
    try {
      if (!isFlowConfigValid(flowConfig)) {
        throw "Flow configuration is invalid.";
      }

      switch (flowConfig.method) {
        case 'GET':
          let httpClientGetOptions: IHttpClientOptions = this._createHttpClientGetOptions();

          if (!httpClientGetOptions) {
            throw "HTTP client options are invalid.";
          }
          return await context.httpClient.get(flowConfig.url, HttpClient.configurations.v1, httpClientGetOptions)
            .then(async (response: HttpClientResponse) => {
              return {
                statusCode: response?.status,
                message: await this._tryGetMessageFromResponseBody(response)
              };
            });
        case 'POST':
          let httpClientPostOptions: IHttpClientOptions = this._createHttpClientPostOptions(context, selectedItems);

          if (!httpClientPostOptions) {
            throw "HTTP client options are invalid.";
          }
          return await context.httpClient.post(flowConfig.url, HttpClient.configurations.v1, httpClientPostOptions)
            .then(async (response: HttpClientResponse) => {
              return {
                statusCode: response?.status,
                message: await this._tryGetMessageFromResponseBody(response)
              };
            });
        default:
          return null;
      }
    } catch (ex) {
      return null;
    }
  }

  private _tryGetMessageFromResponseBody = async (response: HttpClientResponse): Promise<string> => {
    try {
      return await response?.json()?.then((result: any): Promise<any> => {
        return Promise.resolve(result?.message);
      });
    } catch (ex) {
      return null;
    }
  }

  private _createHttpClientPostOptions = (context: ListViewCommandSetContext, selectedItems: readonly RowAccessor[]): IHttpClientOptions => {
    try {
      let processedSelectedItems: ISelectedItem[] = [];

      selectedItems.forEach((selectedItem: RowAccessor): void => {
        let processedSelectedItem: ISelectedItem = {
          id: parseInt(selectedItem?.getValueByName("ID")),
          fileRef: selectedItem?.getValueByName("FileRef"),
          fileLeafRef: selectedItem?.getValueByName("FileLeafRef"),
          fileType: selectedItem?.getValueByName("File_x0020_Type"),
          uniqueIdentifier: selectedItem?.getValueByName("UniqueId")
        };
        processedSelectedItems.push(processedSelectedItem);
      });

      let requestHeaders: Headers = new Headers();
      requestHeaders.append('Content-type', 'application/json');
      requestHeaders.append('Cache-Control', 'no-cache');

      let requestBody: IFlowRequestBody = {
        site: context.pageContext.site.absoluteUrl,
        tenantUrl: context.pageContext.legacyPageContext?.portalUrl,
        listId: context.pageContext.list?.id.toString(),
        culture: context.pageContext.cultureInfo.currentUICultureName,
        selectedItems: processedSelectedItems
      };

      let httpClientOptions: IHttpClientOptions = {
        body: JSON.stringify(requestBody),
        headers: requestHeaders
      };

      return httpClientOptions;
    } catch (ex) {
      return null;
    }
  }

  private _createHttpClientGetOptions = (): IHttpClientOptions => {
    try {
      let requestHeaders: Headers = new Headers();
      requestHeaders.append('Content-type', 'application/json');
      requestHeaders.append('Cache-Control', 'no-cache');

      let httpClientOptions: IHttpClientOptions = {
        body: null,
        headers: requestHeaders
      };

      return httpClientOptions;
    } catch (ex) {
      return null;
    }
  }
}

export const FlowServiceKey = ServiceKey.create<IFlowService>(
  "FlowService:FlowService",
  FlowService
);
