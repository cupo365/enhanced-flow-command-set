import { ISelectedItem, IUser } from ".";


export interface IFlowRequestBody {
  originSecret: string;
  site: string;
  tenantUrl: string;
  listId: string;
  culture: string;
  selectedItems: ISelectedItem[];
  user: IUser;
}
