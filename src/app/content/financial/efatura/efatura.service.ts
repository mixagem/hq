import { Injectable } from '@angular/core';
import { IEfaturaCategory } from 'src/assets/interfaces/iefatura-category';

export type EFaturaCategoryList = {
  [key: number]: IEfaturaCategory
}

// const EFATURA_CATEGORIES: IEfaturaCategory[] = [
//   {
//     id: 1,
//     title: 'Despesas gerais familiares',
//     icon: 'family_restroom',
//     color: '#48c1da'
//   },
//   {
//     id: 2,
//     title: 'Restaurante e alojamento',
//     icon: 'restaurant',
//     color: '#febc17'
//   },
//   {
//     id: 3,
//     title: 'Ginásios',
//     icon: 'fitness_center',
//     color: '#942192'
//   },
//   {
//     id: 4,
//     title: 'Cabeleireiros',
//     icon: 'content_cut',
//     color: '#a98ddf'
//   },
//   {
//     id: 5,
//     title: 'Saúde',
//     icon: 'medical_information',
//     color: '#ff5a59'
//   },
//   {
//     id: 6,
//     title: 'Passes mensais',
//     icon: 'directions_bus',
//     color: '#309ffa'
//   },
// ]

const EFATURA_CATEGORIES: EFaturaCategoryList = {
  0: {
    title: 'Sem categoria',
    icon: 'not_interested',
    color: '#333'
  },
  1: {
    title: 'Despesas gerais familiares',
    icon: 'family_restroom',
    color: '#48c1da'
  },
  2: {
    title: 'Restaurante e alojamento',
    icon: 'restaurant',
    color: '#febc17'
  },
  3: {
    title: 'Ginásios',
    icon: 'fitness_center',
    color: '#942192'
  },
  4: {
    title: 'Cabeleireiros',
    icon: 'content_cut',
    color: '#a98ddf'
  },
  5: {
    title: 'Saúde',
    icon: 'medical_information',
    color: '#ff5a59'
  },
  6: {
    title: 'Passes mensais',
    icon: 'directions_bus',
    color: '#309ffa'
  }
}

@Injectable({
  providedIn: 'root'
})

export class EfaturaService {

  efaturaEnum: EFaturaCategoryList;

  constructor() {
    this.efaturaEnum = {...EFATURA_CATEGORIES};
  }
}
