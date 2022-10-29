
import { Component } from '@angular/core';


@Component({
  selector: 'mhq-efatura',
  templateUrl: './efatura.component.html',
  styleUrls: ['./efatura.component.scss', '../../../../assets/styles/mhq-mainform.scss']
})
export class EfaturaComponent {

  efatura = [{ title: 'Despesas gerais familiares', 'value': 250 , icon:'family_restroom', color:'#48c1da'},
  { title: 'Restaurante e alojamento', 'value': 14.86, icon:'restaurant', color:'#febc17' },
  { title: 'Ginásios', 'value': 0 , icon:'fitness_center', color:'#942192'},
  { title: 'Cabeleireiros', 'value': 3.74, icon:'content_cut', color:'#a98ddf' },
  { title: 'Saúde', 'value': 0 , icon:'medical_information', color:'#ff5a59'},
  { title: 'Passes mensais', 'value': 0 , icon:'directions_bus', color:'#309ffa'}]


}

