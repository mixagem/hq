export interface ITreasuryLog {
  id:number,
  title: string,
  date:number,
  value:number,
  cat:number,
  subcat:number,
  type: string,
  obs:string,
  recurrencyid: number,
  nif: boolean,
  efat: boolean
}
