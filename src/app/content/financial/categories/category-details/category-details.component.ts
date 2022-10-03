import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { FinancialService } from '../../financial.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mhq-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss']
})

export class CategoryDetailsComponent implements OnInit {
  // id da categoria em consulta
  id: number;
  // clone da categoria utilizada em consulta
  fiCategory: IFinancialCategory;
  // clone da categoria utilizada no modo  edição
  tempFiCategory: IFinancialCategory;
  // boolean com o estado do modo de edição
  editingMode: boolean;
  // placeholders com as cores da categoria, para inputs dos colorpickers
  bgColorPicker: string;
  textColorPicker: string;

  constructor(private _route: ActivatedRoute, private _financialService: FinancialService, private _router: Router, private _http: HttpClient, private _dialog: MatDialog) {
    this.editingMode = false; // está aqui porque ao adicionar/remover sub cats, tenho de chama o on-init
  }

  ngOnInit(): void {
    this.id = Number(this._route.snapshot.paramMap.get('id')!);
    [...this._financialService.allCategories].forEach(cat => {
      if (cat.id === this.id) { this.fiCategory = cat; return }
    });
    this.tempFiCategory = { ...this.fiCategory }
    this._financialService.activePreviewCategory = { ...this.fiCategory }
    this._financialService.onInitTrigger.subscribe(myCustomParam => {
      // call your method whenever its triggered.
      this.ngOnInit();
  });
  }

  // modal confirmar remoção da categoria
  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(DeleteCategoryConfirmationModal, {
      width: '50vw',
      height: '50vh',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  // ação de main-form para guardar categorias
  saveCategory(): void {

    const httpParams = new HttpParams().set('cat', JSON.stringify(this.tempFiCategory))
    const call = this._http.post('http://localhost:16190/savecat', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this._financialService.fetchCategories('saveCategories', this.id); this.editingMode = false; },
      error: err => this._financialService.handleError(err)
    })

  }

  fetchCats(refresh: boolean = false) {
    const call = this._http.get('http://localhost:16190/getcats')
    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as IFinancialCategory[];
        // guardar no serviço a resposta da bd
        this._financialService.allCategories = resp;
        this._financialService.expenseCategories = resp.filter(cat => cat.type === 'expense');
        this._financialService.incomeCategories = resp.filter(cat => cat.type === 'income');
        this.ngOnInit();
        if (refresh) {

          // this._financialService.activeCatBorderColor = this.tempFiCategory.bgcolor;
          this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this._router.navigate(['/fi/cats', this.id]);
          });
        }
      }, error: err => this._financialService.handleError(err)
    })
  }

  // switch com operações do registo do modo edição (modo edição, guardar, e/ou discartar alterçaões)
  toggleEditing(action: string): void {
    switch (action) {

      case 'start':
        this.tempFiCategory = JSON.parse(JSON.stringify(this.fiCategory));
        this.editingMode = true;
        this.bgColorPicker = this.tempFiCategory.bgcolor
        this.textColorPicker = this.tempFiCategory.textcolor
        break;

      case 'save':
        // remover a parte do rgb(), e guardar apenas os valores
        this.tempFiCategory.bgcolor = this.bgColorPicker.replace('rgb(', '').replace(')', '');
        this.tempFiCategory.textcolor = this.textColorPicker.replace('rgb(', '').replace(')', '');
        this.saveCategory();
        break;

      case 'end': default:
        this.editingMode = false;

    }
  }

  // fecha a consulta do registo, e retorna para o modo listagem
  closeDetails(): void {

    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')

    const timer = setTimeout(navi.bind(null, this._router), 1000)

    function navi(router: Router): void {
      router.navigate(['/fi/cats'])
    }

  }

  // adicionar sub-categoria à categoria em edição
  addSubCategory(): void {
    const tempSubcat: IFinancialSubCategory = {
      id: Date.now(),
      maincat: this.id,
      title: 'Nova Sub-Categoria',
      budget: 0,
      active: false
    }

    const httpParams = new HttpParams().set('subcat', JSON.stringify(tempSubcat))
    const call = this._http.post('http://localhost:16190/addsubcat', httpParams, { responseType: 'text' })
    call.subscribe({
      next: codeReceived => { this._financialService.fetchCategories('refreshSubcategories', this.id); },
      error: err => this._financialService.handleError(err)
    })
  }

  removeSubCategory(subCatID: number): void {
    const httpParams = new HttpParams().set('subcat', subCatID).set('cat', this.id)
    const call = this._http.post('http://localhost:16190/removesubcat', httpParams, { responseType: 'text' })
    call.subscribe({
      next: codeReceived => { this._financialService.fetchCategories('refreshSubcategories', this.id); },
      error: err => this._financialService.handleError(err)
    })
  }

}

// modal confirmação eliminação categoria
@Component({
  selector: 'delete-category-confirmation-modal',
  templateUrl: './delete-category-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-large-modal.scss']
})
export class DeleteCategoryConfirmationModal {
  constructor(public financialService: FinancialService, public _http: HttpClient, public router: Router) { }

  removeCategory(): void {
    const httpParams = new HttpParams().set('cat', this.financialService.activePreviewCategory.id)
    const call = this._http.post('http://localhost:16190/removecat', httpParams, { responseType: 'text' })
    call.subscribe({
      next: codeReceived => { this.fetchCats(); },
      error: err => this.financialService.handleError(err)
    })
  }

  fetchCats(): void {
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