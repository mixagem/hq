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
  },
  7: {
    title: 'Educação',
    icon: 'school',
    color: '#ff893a',
    usesIVAToCalc: false,
    calcPercentage: 0.3
  },
  8: {
    title: 'Habitação',
    icon: 'home',
    color: '#95d655',
    usesIVAToCalc: false,
    calcPercentage: 0.15
  },
  9: {
    title: 'Reparação de automóveis',
    icon: 'car_repair',
    color: '#357db0',
    usesIVAToCalc: true,
    calcPercentage: 0.15
  },
  10: {
    title: 'Reparação de motociclos',
    icon: 'two_wheeler',
    color: '#55a3db',
    usesIVAToCalc: true,
    calcPercentage: 0.15
  },
  11: {
    title: 'Lares',
    icon: 'elderly_woman',
    color: '#6cb664',
    usesIVAToCalc: false,
    calcPercentage: 0.25
  },
  12: {
    title: 'Atividades veterinárias',
    icon: 'pets',
    color: '#d07361',
    usesIVAToCalc: true,
    calcPercentage: 0.15
  }
}

@Injectable({ providedIn: 'root' })

export class EfaturaService {

  activeEfatCats: number[];
  efaturaTable: EFaturaCategoryList;
  constructor() {

    this.efaturaTable = { ...EFATURA_CATEGORIES };
  }
}
