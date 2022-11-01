import { IFinancialSubCategory } from "./ifinancial-sub-category";

export interface IFinancialCategory {
  id: number,
  type: string,
  title: string,
  icon: string,
  bgcolor: string,
  textcolor:string,
  subcats: IFinancialSubCategory[],
  active: boolean
  order: number
}
