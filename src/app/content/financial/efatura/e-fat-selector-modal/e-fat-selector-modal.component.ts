import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IEfaturaCategory } from 'src/shared/interfaces/iefatura-category';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';
import { EfaturaService } from '../efatura.service';

@Component({
  selector: 'mhq-e-fat-selector-modal',
  templateUrl: './e-fat-selector-modal.component.html',
  styleUrls: ['./e-fat-selector-modal.component.scss', './../../../../../shared/styles/mhq-modal.scss']
})
export class EFatSelectorModalComponent implements OnInit {

  categories: IEfaturaCategory[];
  tempActiveEFatCats: number[]

  constructor(private _errorHandlingService: ErrorHandlingService, private _router: Router, private _http: HttpClient, private _mhqSnackbarService: MHQSnackBarsService, public eFaturaService: EfaturaService) {
    this.categories = [];
    this.tempActiveEFatCats = [];
  }

  ngOnInit(): void {

    for (let i = 1; i < Object.keys(this.eFaturaService.efaturaTable).length; i++) {
      this.categories.push(this.eFaturaService.efaturaTable[i])
    }

    this.tempActiveEFatCats = JSON.parse(JSON.stringify(this.eFaturaService.activeEfatCats));
  }

  toggleEfatCat(efatCatID: number): void {
    if (this.tempActiveEFatCats.includes(efatCatID)) {
      this.tempActiveEFatCats = this.tempActiveEFatCats.filter(efatCat => efatCat !== efatCatID)
    } else {
      this.tempActiveEFatCats.push(efatCatID)
    }

  }


  saveEFatCatsSelection(): void {

    const HTTP_PARAMS = new HttpParams().set('efatselection', JSON.stringify(this.tempActiveEFatCats))
    const CALL = this._http.post('http://localhost:16190/efatcatselectionsave', HTTP_PARAMS, { responseType: 'json' })
    // const CALL = this._http.post('http://localhost/hq/php/efat/newefat.php', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as string[];
        if (RESP[0] === 'MHQERROR') {
          this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [RESP[1], '']);
        }
        else {
          const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
          { this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigateByUrl('/fi/efat', { skipLocationChange: true }) }); }

          this._mhqSnackbarService.triggerMHQSnackbar(true, 'save_as', '', [RESP[0], '']);
        }
      },
      error: err => this._errorHandlingService.handleError(err)
    })



  }

  // isEfatCatActive(efatcatID:number) :boolean {

  //   this.
  //   return
  // }




}
