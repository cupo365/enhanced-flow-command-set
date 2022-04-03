import { ISelectedFile } from "./ISelectedFile";

export interface IFlowRequestBody {
  site: string;
  tenantUrl: string;
  selectedFiles: ISelectedFile[];
}
