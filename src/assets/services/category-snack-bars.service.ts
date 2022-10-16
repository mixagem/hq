import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MhqFailureSnackBarComponent } from '../components/mhq-failure-snack-bar/mhq-failure-snack-bar.component';
import { MhqSucessSnackBarComponent } from '../components/mhq-sucess-snack-bar/mhq-sucess-snack-bar.component';

@Injectable({
  providedIn: 'root'
})

export class CategorySnackBarsService {

  snackBarText: string[];
  snackBarSpecialText: string;
  snackBarIcon: string;

  constructor(private _snackBar: MatSnackBar) { }


  triggerCategoriesSnackbar(status: boolean,icon: string, specialText: string, text: string[]): void {
    this._snackBar.dismiss();
    this.snackBarSpecialText = specialText;
    this.snackBarIcon = icon;
    this.snackBarText = text;
    status ? this._snackBar.openFromComponent(MhqSucessSnackBarComponent, { duration: 5000, panelClass:'sucess' }) : this._snackBar.openFromComponent(MhqFailureSnackBarComponent, { duration: 5000, panelClass:'failure' });// dispara a snackbar
  }


}
