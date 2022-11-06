import { IAdvancedSearchParameters } from "./iadanved-search-parameters";

export interface IAdvancedSearch {
  id: number,
  title: string,
  active: boolean,
  entity: string,
  parameters: IAdvancedSearchParameters[],
}
