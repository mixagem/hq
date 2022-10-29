import { Injectable } from '@angular/core';

export type IMenuEntry = {
  isMainTitle: boolean,
  haveChild: boolean,
  name: string,
  route: string,
  parentEntry: string,
  icon?: string
}

@Injectable({ providedIn: 'root' })

export class NavmenuService {
  menuEntries: IMenuEntry[] = [
    {
      isMainTitle: true,
      haveChild: false,
      name: 'Dashboard',
      route: '/dashboard',
      parentEntry: 'dashboard',
      icon: 'space_dashboard'
    },{
      isMainTitle: true,
      haveChild: false,
      name: 'Agenda',
      route: '/agenda',
      parentEntry: 'agenda',
      icon: 'calendar_month'
    },{
      isMainTitle: true,
      haveChild: true,
      name: 'Tesouraria',
      route: '/fi',
      parentEntry: 'fi',
      icon: 'account_balance'
    },{
      isMainTitle: false,
      haveChild: false,
      name: 'Grelha movimentos',
      route: '/fi/grid/',
      parentEntry: 'fi'
    },{
      isMainTitle: false,
      haveChild: false,
      name: 'Categorias movimentos',
      route: '/fi/cats',
      parentEntry: 'fi'
    },{
      isMainTitle: false,
      haveChild: false,
      name: 'Movimentos tesouraria',
      route: '/fi/tlogs',
      parentEntry: 'fi'
    },{
      isMainTitle: false,
      haveChild: false,
      name: 'Orçamentos',
      route: '/fi/budget',
      parentEntry: 'fi'
    },{
      isMainTitle: false,
      haveChild: false,
      name: 'E-Fatura check',
      route: '/fi/efatcheck',
      parentEntry: 'fi'
    },{
      isMainTitle: false,
      haveChild: false,
      name: 'Análise salarial',
      route: '/fi/salaryrev',
      parentEntry: 'fi'
    },{
      isMainTitle: false,
      haveChild: false,
      name: 'Análise orçamental',
      route: '/fi/budgetrev',
      parentEntry: 'fi'
    },{
      isMainTitle: false,
      haveChild: false,
      name: 'Gráficos',
      route: '/fi/graphs',
      parentEntry: 'fi'
    }
  ]
}
