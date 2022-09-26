import { IFinancialSubCategory } from "./ifinancial-sub-category";

export interface IFinancialCategory {
  id: string,
  type: string,
  title: string,
  icon: string,
  color: string,
  subcats: IFinancialSubCategory[],
  inactive: boolean
}
