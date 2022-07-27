import { ISelectedItem } from "./ISelectedItem";

export interface IFlowRequestBody {
  site: string;
  tenantUrl: string;
  listId: string;
  culture: string;
  selectedItems: ISelectedItem[];
}
