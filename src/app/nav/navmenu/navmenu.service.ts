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
      haveChild: true,
      name: 'Agenda',
      route: '/agenda',
      parentEntry: 'agenda',
      icon: 'calendar_month'
    },{
      isMainTitle: false,
      haveChild: false,
      name: 'Agenda',
      route: '/agenda/derp',
      parentEntry: 'agenda'
    },{
      isMainTitle: true,
      haveChild: true,
      name: 'Settings',
      route: '/settings',
      parentEntry: 'settings',
      icon: 'settings'
    },{
      isMainTitle: false,
      haveChild: false,
      name: 'Expense types',
      route: '/settings/mitypes',
      parentEntry: 'settings'
    }
  ]
}
