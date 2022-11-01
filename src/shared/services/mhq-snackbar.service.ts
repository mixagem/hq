import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MhqSnackBarComponent } from 'src/shared/components/mhq-snack-bar/mhq-snack-bar.component';

@Injectable({ providedIn: 'root' })

export class MHQSnackBarsService {

  snackBarText: string[];
  snackBarSpecialText: string;
  snackBarIcon: string;

  constructor(private _snackBar: MatSnackBar) { }

  triggerMHQSnackbar(status: boolean, icon: string, specialText: string, text: string[]): void {
    this._snackBar.dismiss();
    this.snackBarSpecialText = specialText;
    this.snackBarIcon = icon;
    this.snackBarText = text;
    status ? this._snackBar.openFromComponent(MhqSnackBarComponent, { duration: 5000, panelClass: 'mhq-sucess-snackbar' }) : this._snackBar.openFromComponent(MhqSnackBarComponent, { duration: 5000, panelClass: 'mhq-failure-snackbar' });// dispara a snackbar
  }
}
