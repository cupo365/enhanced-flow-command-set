import { ServiceKey } from "@microsoft/sp-core-library";
import { ListViewCommandSetContext, RowAccessor } from "@microsoft/sp-listview-extensibility";
import { IFlowConfig, IFlowRequestBody, IFlowResponse, ISelectedFile, isFlowConfigValid } from "../models";
import { HttpClient, IHttpClientOptions, HttpClientResponse } from '@microsoft/sp-http';

export interface IFlowService {
  invokeFlow(context: ListViewCommandSetContext, flowConfig: IFlowConfig, selectedItems: readonly RowAccessor[]): Promise<IFlowResponse>;
}

export default class FlowService implements IFlowService {
  constructor() {}

  public invokeFlow = async (context: ListViewCommandSetContext, flowConfig: IFlowConfig, selectedItems: readonly RowAccessor[]): Promise<IFlowResponse> => {
    try {
      if (!isFlowConfigValid(flowConfig)) {
        throw new Error("Flow configuration is invalid.");
      }

      switch(flowConfig.trigger.method) {
        case 'GET':
          let httpClientGetOptions: IHttpClientOptions = this._createHttpClientGetOptions();

          if (!httpClientGetOptions) {
            throw new Error("HTTP client options are invalid.");
          }
          return await context.httpClient.get(flowConfig.trigger.url, HttpClient.configurations.v1, httpClientGetOptions)
            .then(async (response: HttpClientResponse) => {
              return {
                statusCode: response?.status,
                message: await this._tryGetMessageFromResponseBody(response)
              };
          });
        case 'POST':
          let httpClientPostOptions: IHttpClientOptions = this._createHttpClientPostOptions(context, selectedItems);

          if (!httpClientPostOptions) {
            throw new Error("HTTP client options are invalid.");
          }
          return await context.httpClient.post(flowConfig.trigger.url, HttpClient.configurations.v1, httpClientPostOptions)
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
      return await response?.json()?.then((result) => {
        return result?.message;
      });
    } catch (ex) {
      return null;
    }
  }

  private _createHttpClientPostOptions = (context: ListViewCommandSetContext, selectedItems: readonly RowAccessor[]): IHttpClientOptions => {
    try {
      let processedSelectedFiles: ISelectedFile[] = [];

      selectedItems.forEach((selectedItem: RowAccessor) => {
        let processedSelectedFile: ISelectedFile = {
          id: parseInt(selectedItem?.getValueByName("ID")),
          fileRef: selectedItem?.getValueByName("FileRef"),
          fileLeafRef: selectedItem?.getValueByName("FileLeafRef"),
          fileType: selectedItem?.getValueByName("File_x0020_Type"),
          editor: selectedItem?.getValueByName("Editor")[0]?.email
        };
        processedSelectedFiles.push(processedSelectedFile);
      });

      let requestHeaders: Headers = new Headers();
      requestHeaders.append('Content-type', 'application/json');
      requestHeaders.append('Cache-Control', 'no-cache');

      let requestBody: IFlowRequestBody = {
        site: context.pageContext.site.absoluteUrl,
        tenantUrl: context.pageContext.legacyPageContext?.portalUrl,
        selectedFiles: processedSelectedFiles
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
