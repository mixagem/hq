import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { FinancialService } from '../../financial.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'delete-category-confirmation-modal',
  templateUrl: './delete-category-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-large-modal.scss']
})
export class DeleteCategoryConfirmationModal {
  constructor(public financialService: FinancialService,public _http: HttpClient,public router: Router) { }

  removeCategory(): void {
    const httpParams = new HttpParams().set('cat', this.financialService.activePreviewCategory.id)
    const call = this._http.post('http://localhost:16190/removecat', httpParams, { responseType: 'text' })
    call.subscribe({
      next: codeReceived => { this.fetchCats(); },
      error: err => this.financialService.handleError(err)
    })
  }

  fetchCats() {
    const call = this._http.get('http://localhost:16190/getcats')
    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as IFinancialCategory[];
        this.financialService.expenseCategories = resp.filter(cat => cat.type === 'expense');
        this.financialService.incomeCategories = resp.filter(cat => cat.type === 'income');
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')

        const timer = setTimeout(navi.bind(null, this.router), 1000) // tempo da animação antes de redirecionar
        function navi(router: Router): void {
          //marteladinha para fechar a modal
          const ele = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
          ele.click();
          router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            router.navigate(['/fi/cats']);
          });
        }
      }, error: err => this.financialService.handleError(err)
    })
  }
}


@Component({
  selector: 'mhq-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent implements OnInit {
  id: number;
  fiCategory: IFinancialCategory;
  editingMode: boolean;
  orderingSubCategories: boolean;
  tempFiCategory: IFinancialCategory;

  constructor(private _route: ActivatedRoute, private _financialService: FinancialService, public _router: Router, public _http: HttpClient, public dialog: MatDialog) {
    this.editingMode = false;
    this.orderingSubCategories = false;
  }

  ngOnInit(): void {
    this.id = Number(this._route.snapshot.paramMap.get('id')!);
    this.fiCategory = [...this._financialService.expenseCategories, ...this._financialService.incomeCategories].filter(obj => {
      return obj.id === this.id
    })[0];
    this.tempFiCategory = JSON.parse(JSON.stringify(this.fiCategory));
    this._financialService.activePreviewCategory = JSON.parse(JSON.stringify(this.fiCategory));
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(DeleteCategoryConfirmationModal, {
      width: '50vw',
      height: '50vh',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  saveCats(): void {
    const httpParams = new HttpParams().set('cat', JSON.stringify(this.tempFiCategory))
    const call = this._http.post('http://localhost:16190/savecat', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.fetchCats(); this.editingMode = false; },
      error: err => this._financialService.handleError(err)
    })
  }

  fetchCats() {
    const call = this._http.get('http://localhost:16190/getcats')
    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as IFinancialCategory[];
        this._financialService.expenseCategories = resp.filter(cat => cat.type === 'expense');
        this._financialService.incomeCategories = resp.filter(cat => cat.type === 'income');
        this.ngOnInit();
      }, error: err => this._financialService.handleError(err)
    })
  }

  toggleEditing(action: string): void {
    switch (action) {
      case 'start':
        this.tempFiCategory = JSON.parse(JSON.stringify(this.fiCategory));
        this.editingMode = true;
        break;

      case 'save':
        this.saveCats();
        break;

      case 'end': default:
        this.editingMode = false;
    }
  }

  closeDetails(): void {
    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
    const timer = setTimeout(navi.bind(null, this._router), 1000) // tempo da animação antes de redirecionar
    function navi(router: Router): void {
      router.navigate(['/fi/cats'])
    }
  }

  addSubCategory(catID: number) {
    const tempSubcat: IFinancialSubCategory = {
      id: Date.now(),
      maincat: catID,
      title: 'Nova sub-categoria',
      budget: 0,
      active: false
    }

    const httpParams = new HttpParams().set('subcat', JSON.stringify(tempSubcat))
    const call = this._http.post('http://localhost:16190/addsubcat', httpParams, { responseType: 'text' })
    call.subscribe({
      next: codeReceived => { this.fetchCats(); },
      error: err => this._financialService.handleError(err)
    })
  }

  removeSubCategory(subCatID: number): void {
    console.log(subCatID);
    console.log(this.id);
    const httpParams = new HttpParams().set('subcat', subCatID).set('cat', this.id)
    const call = this._http.post('http://localhost:16190/removesubcat', httpParams, { responseType: 'text' })
    call.subscribe({
      next: codeReceived => { this.fetchCats(); },
      error: err => this._financialService.handleError(err)
    })
  }

}
