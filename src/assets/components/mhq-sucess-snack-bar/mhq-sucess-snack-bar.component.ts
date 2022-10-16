import { Component, OnInit } from '@angular/core';
import { CategorySnackBarsService } from 'src/assets/services/snack-bars.service';

@Component({
  selector: 'mhq-mhq-sucess-snack-bar',
  templateUrl: './mhq-sucess-snack-bar.component.html',
  styleUrls: ['./mhq-sucess-snack-bar.component.scss']
})
export class MhqSucessSnackBarComponent implements OnInit {

  constructor(public categorySnackBarsService:CategorySnackBarsService) { }

  ngOnInit(): void {
  }

}
