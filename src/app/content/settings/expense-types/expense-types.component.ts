import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddNewTypeModalComponent } from './add-new-type-modal/add-new-type-modal.component';

@Component({
  selector: 'mhq-expense-types',
  templateUrl: './expense-types.component.html',
  styleUrls: ['./expense-types.component.scss']
})
export class ExpenseTypesComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(AddNewTypeModalComponent, {
      width: '60vw',
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'mhq-modal-wrappper',
      height: '60vh'
    });
  }

  ngOnInit(): void {
  }

}
