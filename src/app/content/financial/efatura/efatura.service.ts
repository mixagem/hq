import { Injectable } from '@angular/core';
import { IEfaturaCategory } from 'src/shared/interfaces/iefatura-category';

export type EFaturaCategoryList = {
  [key: number]: IEfaturaCategory
}

const EFATURA_CATEGORIES: EFaturaCategoryList = {
  0: {
    title: 'Sem categoria',
    icon: 'not_interested',
    color: '#333',
    usesIVAToCalc: false,
    calcPercentage: 0
  },
  1: {
    title: 'Despesas gerais familiares',
    icon: 'family_restroom',
    color: '#48c1da',
    usesIVAToCalc: false,
    calcPercentage: 0.35
  },
  2: {
    title: 'Restaurante e alojamento',
    icon: 'restaurant',
    color: '#febc17',
    usesIVAToCalc: true,
    calcPercentage: 0.15
  },
  3: {
    title: 'Ginásios',
    icon: 'fitness_center',
    color: '#942192',
    usesIVAToCalc: true,
    calcPercentage: 0.15
  },
  4: {
    title: 'Cabeleireiros',
    icon: 'content_cut',
    color: '#a98ddf',
    usesIVAToCalc: true,
    calcPercentage: 0.15
  },
  5: {
    title: 'Saúde',
    icon: 'medical_information',
    color: '#ff5a59',
    usesIVAToCalc: false,
    calcPercentage: 0.15
  },
  6: {
    title: 'Passes mensais',
    icon: 'directions_bus',
    color: '#309ffa',
    usesIVAToCalc: true,
    calcPercentage: 1
  }
}

@Injectable({ providedIn: 'root' })

export class EfaturaService {

  efaturaTable: EFaturaCategoryList;

  constructor() {
    this.efaturaTable = { ...EFATURA_CATEGORIES };
  }
}
