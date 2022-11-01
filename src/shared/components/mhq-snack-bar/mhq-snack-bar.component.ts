import { Component, OnInit } from '@angular/core';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';

@Component({
  selector: 'mhq-mhq-snack-bar',
  templateUrl: './mhq-snack-bar.component.html',
  styleUrls: ['./mhq-snack-bar.component.scss']
})
export class MhqSnackBarComponent implements OnInit {

  constructor(public mhqSnackbarService:MHQSnackBarsService) { }

  ngOnInit(): void {
  }

}
