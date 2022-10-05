import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { FinancialService } from '../../financial.service';
import { map, startWith } from 'rxjs/operators';
import { MatDatepicker } from '@angular/material/datepicker';
import { TreasuryService } from '../treasury.service';

@Component({
  selector: 'mhq-treasury-details',
  templateUrl: './treasury-details.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})

export class TreasuryDetailsComponent implements OnInit {

  // datepicker
  tlogDatePicker: MatDatepicker<any>;
  mypick: FormControl<any>;

  // autocomplete categoria
  catForm = new FormControl('');
  catFormOptions: string[] = [];
  catFilteredOptions: Observable<string[]>;
  private _catfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.catFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  // autocomplete sub categoria
  subCatForm = new FormControl('');
  subCatFormOptions: string[] = [];
  subCatFilteredOptions: Observable<string[]>;
  private _subcatfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.subCatFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  // id do movimento em consulta
  id: number;
  // clone do movimento utilizada em consulta
  treasuryLog: ITreasuryLog;
  // clone do moviment utilizada no modo edição
  tempTreasuryLog: ITreasuryLog;
  // boolean com o estado do modo de edição
  editingMode: boolean;

  constructor(private _route: ActivatedRoute, public _router: Router, public treasuryService: TreasuryService, public dialog: MatDialog, public _http: HttpClient, private _financialService: FinancialService) {
    this.editingMode = false;
  }

  ngOnInit(): void {
    // id
    this.id = Number(this._route.snapshot.paramMap.get('id')!);
    // fetch snapshot
    // this.tlog = this.treasuryService.treasuryLog.filter(tlog => {
    //   return tlog.id === this.id
    // })[0];
    [...this.treasuryService.treasuryLog].forEach(tlog => {
      if (tlog.id === this.id) { this.treasuryLog = tlog; return }
    });
    // tlog snapshot
    this.tempTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));
    // clonse snapshot para editar
    this.treasuryService.activeTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));

    // auto complete categoria

    this.catFormOptions = [];
    const allCats = [...this._financialService.allCategories]
    allCats.forEach(cat => {
      this.catFormOptions.push(cat.title)
    });

    this.catFilteredOptions = this.catForm.valueChanges.pipe(
      startWith(''),
      map(value => this._catfilter(value || '')),
    );

    // auto complete sub categoria categoria
    this.subCatFilteredOptions = this.subCatForm.valueChanges.pipe(
      startWith(''),
      map(value => this._subcatfilter(value || '')),
    );

    this.subCatFormOptions = [];
    allCats.forEach(cat => {
      cat.subcats.forEach(subcat => {
        this.subCatFormOptions.push(subcat.title)
      });
    });

    //datepicker
    this.mypick = new FormControl(new Date(this.treasuryService.activeTreasuryLog.date));
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(DeleteTlogConfirmationModal, {
      width: '50vw',
      height: '50vh',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  saveTlog(): void {

    const httpParams = new HttpParams().set('tlog', JSON.stringify(this.tempTreasuryLog))
    const call = this._http.post('http://localhost:16190/savetlog', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.treasuryService.fetchTreasuryLog('saveTreasuryLog', this.tempTreasuryLog.id); this.editingMode = false; },
      error: err => this.treasuryService.handleError(err)
    })
  }

  toggleEditing(action: string): void {

    switch (action) {

      case 'start':

        this.tempTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));

        this.editingMode = true;

        break;

      case 'save':

        this.tempTreasuryLog.date = new Date(this.mypick.value.toISOString()).getTime();

        const catID = [...this._financialService.allCategories].filter(cat => cat.title === this.catForm.value)[0].id

        const subcatstofilter = [...this._financialService.allCategories].filter(cat => cat.id == catID)[0].subcats;

        const subCatID = subcatstofilter.filter(subcat => subcat.title === this.subCatForm.value)[0].id

        this.tempTreasuryLog.cat = catID;
        this.tempTreasuryLog.subcat = subCatID;

        this.saveTlog();

        break;

      case 'end': default:
        this.editingMode = false;
    }
  }

}

@Component({
  selector: 'delete-tlog-confirmation-modal',
  templateUrl: './delete-tlog-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-large-modal.scss']
})

export class DeleteTlogConfirmationModal {

  constructor(public treasuryService: TreasuryService, public _http: HttpClient, public router: Router) { }

  removeTreasuryLog() {

    const httpParams = new HttpParams().set('tlog', this.treasuryService.activeTreasuryLog.id)
    const call = this._http.post('http://localhost:16190/removetlog', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.treasuryService.fetchTreasuryLog('removeTreasuryLog'); },
      error: err => this.treasuryService.handleError(err)
    })
  }
}

