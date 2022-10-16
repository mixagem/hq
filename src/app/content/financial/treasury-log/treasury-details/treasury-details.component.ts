import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { TreasuryService } from '../treasury.service';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { ErrorHandlingService, MiscService } from 'src/assets/services/misc.service';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MissingCategoriesSnackBarComponent } from '../missing-categories-snack-bar/missing-categories-snack-bar.component';
import { CategorySnackBarsService } from 'src/assets/services/category-snack-bars.service';

@Component({
  selector: 'mhq-treasury-details',
  templateUrl: './treasury-details.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})

export class TreasuryDetailsComponent implements OnInit {

  // datepicker
  treasuryLogDatepicker: MatDatepicker<any>;
  treasuryLogDatepickerForm: FormControl<any>;

  // autocomplete categoria
  catForm: FormControl
  categoriesList: string[] = [];


  // autocomplete sub categoria
  subcatForm: FormControl
  subcategoriesList: string[] = [];

  // id do movimento em consulta
  id: number;

  // clone do movimento utilizada em consulta
  treasuryLog: ITreasuryLog;
  // clone do moviment utilizada no modo edição
  tempTreasuryLog: ITreasuryLog;

  // boolean com o estado do modo de edição
  editingMode: boolean;

  constructor(private _errorHandlingService: ErrorHandlingService, private _snackBar: MatSnackBar, private _route: ActivatedRoute, public treasuryService: TreasuryService, private _dialog: MatDialog, private _http: HttpClient, private _categoriesService: CategoriesService, public miscService: MiscService, private _categoriesSnackBarService: CategorySnackBarsService) {
    this.editingMode = false;
  }

  ngOnInit(): void {

    // obter id
    this.id = Number(this._route.snapshot.paramMap.get('id')!);

    // obter snapshot do movimento
    this.treasuryLog = [...this.treasuryService.treasuryLog].filter(treasurylog => treasurylog.id === this.id)[0];

    // clone do movimento para modo de edição
    this.tempTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));

    // clone do movimento enviado para o serviço
    this.treasuryService.activeTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));

    // datepicker
    this.treasuryLogDatepickerForm = new FormControl(new Date(this.treasuryLog.date), [Validators.required]);

    // forms para inputs autocomplete

    this.catForm = new FormControl(this.miscService.getCategoryTitle(this.tempTreasuryLog.cat), [Validators.required]);
    this.subcatForm = new FormControl({ value: this.miscService.getSubcategoryTitle(this.tempTreasuryLog.cat, this.tempTreasuryLog.subcat), disabled: true }, [Validators.required]);

    this.miscService.getCategoryObjectFromID(this.tempTreasuryLog.cat).subcats.forEach(subcat => {
      this.subcategoriesList.push(subcat.title)
    });
    this.subcatForm.enable();


    // opções para select
    this._categoriesService.allCategories.forEach(cat => {
      this.categoriesList.push(cat.title)
    });


  }

  saveTreasurylog(): void {

    const httpParams = new HttpParams().set('tlog', JSON.stringify(this.tempTreasuryLog))
    const call = this._http.post('http://localhost:16190/updatetreasurylog', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => {
        this.treasuryService.fetchTreasuryLog('saveTreasuryLog', this.tempTreasuryLog.id);
        this.editingMode = false;
        this._categoriesSnackBarService.triggerCategoriesSnackbar(true, 'save_as', this.tempTreasuryLog.title, ['O movimento ', ' foi atualizado com sucesso.']); // dispara a snackbar
      },
      error: err => {
        this._errorHandlingService.handleError(err);
        this._categoriesSnackBarService.triggerCategoriesSnackbar(false, 'report', this.tempTreasuryLog.title, ['Ocurreu algo inesperado ao atualizar o movimento ', '.']); // dispara a snackbar}
      }
    })
  }

  openMissingCategoriesSnackBar(): void {
    this._snackBar.openFromComponent(MissingCategoriesSnackBarComponent, {
      duration: 5000, //ms
    });
  }

  editingTreasuryLogRecordActions(action: string): void {

    switch (action) {

      case 'start':

        this.tempTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));
        this.editingMode = true;
        break;

      case 'save':

        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return this.openMissingCategoriesSnackBar() }

        this.tempTreasuryLog.date = this.treasuryLogDatepickerForm.value.getTime();

        const cat = [...this._categoriesService.allCategories].filter(cat => cat.title === this.catForm.value)[0]
        const catBGColor: string = cat.bgcolor;
        const subcats: IFinancialSubCategory[] = cat.subcats;
        const catID: number = cat.id;
        // obter o ID da sub-categoria selecionada
        const subCatID: number = subcats.filter(subcat => subcat.title === this.subcatForm.value)[0].id

        // converter de títilo para o id das catgorias
        this.tempTreasuryLog.cat = catID;
        this.tempTreasuryLog.subcat = subCatID;
        this.treasuryService.recordBorderStyle['background-color'] = catBGColor!;

        this.tempTreasuryLog.value = Number(this.tempTreasuryLog.value.toString().replace(',', '.')) // conversão de vírgulas para pontos

        if (!this.tempTreasuryLog.value.toString().match(/^[0-9]*\.{0,1}[0-9]{0,2}$/g)) {
          this._categoriesSnackBarService.triggerCategoriesSnackbar(false, 'report', 'Valor', ['O campo ', ' encontra-se incorretamente definido.']);
          return;
        }

        this.saveTreasurylog();

        break;

      case 'end': default:
        this.editingMode = false;
    }
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(DeleteTreasuryLogConfirmationModal, {
      width: '580px',
      height: '220px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  categorySelectChanged(event: MatSelectChange): void {
    const categoryID = this.miscService.getCategoryIDFromTitle(event.value);
    const category = this._categoriesService.allCategories.filter(cat => cat.id === categoryID)[0];

    this.subcategoriesList = [];
    category.subcats.forEach(subcat => {
      this.subcategoriesList.push(subcat.title)
    });

    this.subcatForm.setValue('')
    this.subcategoriesList.length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
  }

}

@Component({
  selector: 'delete-tlog-confirmation-modal',
  templateUrl: './delete-tlog-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-large-modal.scss']
})

export class DeleteTreasuryLogConfirmationModal {

  constructor(public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService) { }

  deleteTreasuryLog() {

    const httpParams = new HttpParams().set('tlog', this.treasuryService.activeTreasuryLog.id)
    const call = this._http.post('http://localhost:16190/deletetreasurylog', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.treasuryService.fetchTreasuryLog('deleteTreasuryLog'); },
      error: err => this._errorHandlingService.handleError(err)
    })
  }
}



