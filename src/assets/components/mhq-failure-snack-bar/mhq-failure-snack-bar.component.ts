import { Component, OnInit } from '@angular/core';
import { CategorySnackBarsService } from 'src/assets/services/category-snack-bars.service';

@Component({
  selector: 'mhq-mhq-failure-snack-bar',
  templateUrl: './mhq-failure-snack-bar.component.html',
  styleUrls: ['./mhq-failure-snack-bar.component.scss']
})
export class MhqFailureSnackBarComponent implements OnInit {

  constructor(public categorySnackBarsService:CategorySnackBarsService) { }

  ngOnInit(): void {
  }

}
