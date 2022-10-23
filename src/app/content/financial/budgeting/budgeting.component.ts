import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'mhq-budgeting',
  templateUrl: './budgeting.component.html',
  styleUrls: ['./budgeting.component.scss', '../../../../assets/styles/mhq-mainform.scss']
})
export class BudgetingComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

}
