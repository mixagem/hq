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

@Component({
  selector: 'delete-tlog-confirmation-modal',
  templateUrl: './delete-tlog-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-large-modal.scss']
})

export class DeleteTlogConfirmationModal {
  constructor(public financialService: FinancialService, public _http: HttpClient, public router: Router) { }

  fetchTlog() {
    const call = this._http.get('http://localhost:16190/gettlogs')
    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as ITreasuryLog[];
        this.financialService.treasuryLog = resp;
        const timer = setTimeout(navi.bind(null, this.router), 1000) // tempo da animação antes de redirecionar
        function navi(router: Router): void {
          //marteladinha para fechar a modal
          const ele = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
          ele.click();
          router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            router.navigate(['/fi/tlogs']);
          });
        }
      }, error: err => this.financialService.handleError(err)
    })
  }

  removeTlog() {
    const httpParams = new HttpParams().set('tlog', this.financialService.activeTreasuryLog.id)
    const call = this._http.post('http://localhost:16190/removetlog', httpParams, { responseType: 'text' })
    call.subscribe({
      next: codeReceived => {
        this.fetchTlog();
      },
      error: err => this.financialService.handleError(err)
    })
  }
}


@Component({
  selector: 'mhq-treasury-details',
  templateUrl: './treasury-details.component.html',
  styleUrls: ['./treasury-details.component.scss']
})
export class TreasuryDetailsComponent implements OnInit {

  tlogDatePicker: MatDatepicker<any>;
  mypick: FormControl<any>;

  catForm = new FormControl('');
  catFormOptions: string[] = [];
  catFilteredOptions: Observable<string[]>;

  subCatForm = new FormControl('');
  subCatFormOptions: string[] = [];
  subCatFilteredOptions: Observable<string[]>;

  editingMode: boolean;
  id: number;
  tlog: ITreasuryLog;
  tempTlog: ITreasuryLog;

  constructor(private _route: ActivatedRoute, public _router: Router, private _financialService: FinancialService, public dialog: MatDialog, public _http: HttpClient) {
    this.editingMode = false;
  }



  private _catfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.catFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  private _subcatfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.subCatFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    // id
    this.id = Number(this._route.snapshot.paramMap.get('id')!);
    // fetch snapshot
    this.tlog = this._financialService.treasuryLog.filter(tlog => {
      return tlog.id === this.id
    })[0];
    // tlog snapshot
    this.tempTlog = JSON.parse(JSON.stringify(this.tlog));
    // clonse snapshot para editar
    this._financialService.activeTreasuryLog = JSON.parse(JSON.stringify(this.tlog));

    // auto complete
    this.catFilteredOptions = this.catForm.valueChanges.pipe(
      startWith(''),
      map(value => this._catfilter(value || '')),
    );

    // auto complete
    this.subCatFilteredOptions = this.subCatForm.valueChanges.pipe(
      startWith(''),
      map(value => this._subcatfilter(value || '')),
    );

    this.catFormOptions = [];
    this.subCatFormOptions = [];
    const allCats = [...this._financialService.expenseCategories, ...this._financialService.incomeCategories]
    const fetchCatLabels = allCats.forEach(cat => {
      this.catFormOptions.push(cat.title)
    });
    const fetchSubCatLabels = allCats.forEach(cat => {
      cat.subcats.forEach(subcat => {
        this.subCatFormOptions.push(subcat.title)
      });
    });
    //datepicker
    this.mypick = new FormControl(new Date(this._financialService.activeTreasuryLog.date));
  }

  closeDetails(): void {
    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
    const timer = setTimeout(navi.bind(null, this._router), 1000) // tempo da animação antes de redirecionar
    function navi(router: Router): void {
      router.navigate(['/fi/tlogs'])
    }
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(DeleteTlogConfirmationModal, {
      width: '50vw',
      height: '50vh',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  getCatLabel(catID: number): string {
    const title = [...this._financialService.expenseCategories, ...this._financialService.incomeCategories].filter(cat => cat.id == catID)[0].title
    return title
  }

  getSubCatLabel(catID: number, subcatID: number): string {
    const maincat = [...this._financialService.expenseCategories, ...this._financialService.incomeCategories].filter(cat => cat.id == catID)[0]
    const subcatTitle = [...maincat.subcats].filter(subcat => subcat.id == subcatID)[0].title;
    return subcatTitle
  }

  toggleEditing(action: string): void {
    switch (action) {
      case 'start':
        this.tempTlog = JSON.parse(JSON.stringify(this.tlog));
        this.editingMode = true;
        break;

      case 'save':

        this.tempTlog.date = new Date(this.mypick.value.toISOString()).getTime();

        const catID = [...this._financialService.incomeCategories, ...this._financialService.expenseCategories].filter(cat => cat.title === this.catForm.value)[0].id

        const subcatstofilter = [...this._financialService.incomeCategories, ...this._financialService.expenseCategories].filter(cat => cat.id == catID)[0].subcats;

        const subCatID = subcatstofilter.filter(subcat => subcat.title === this.subCatForm.value)[0].id

        this.tempTlog.cat = catID;
        this.tempTlog.subcat = subCatID;

        this.saveTlog();

        break;

      case 'end': default:
        this.editingMode = false;
    }
  }


  saveTlog(): void {

    const httpParams = new HttpParams().set('tlog', JSON.stringify(this.tempTlog))
    const call = this._http.post('http://localhost:16190/savetlog', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.fetchTlog(this.tempTlog.id); this.editingMode = false; },
      error: err => this._financialService.handleError(err)
    })
  }


  fetchTlog(tlogID: number) {
    const call = this._http.get('http://localhost:16190/gettlogs')
    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as ITreasuryLog[];
        this._financialService.treasuryLog = resp;
        this.ngOnInit();

        const timer = setTimeout(navi.bind(null, this._router), 1000) // tempo da animação antes de redirecionar
        function navi(router: Router): void {
          //marteladinha para fechar a modal
          // const ele = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
          // ele.click();
          router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            router.navigate(['/fi/tlogs', tlogID]);
          });
        }
      }, error: err => this._financialService.handleError(err)
    })
  }

}

