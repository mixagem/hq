import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { map, startWith } from 'rxjs/operators';
import { MatDatepicker } from '@angular/material/datepicker';
import { TreasuryService } from '../treasury.service';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';

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
  catFormOptions: string[] = [];
  catFilteredOptions: Observable<string[]>;
  private _catfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.catFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  // autocomplete sub categoria
  subCatForm: FormControl
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

  constructor(private _route: ActivatedRoute, public treasuryService: TreasuryService, private _dialog: MatDialog, private _http: HttpClient, private _categoriesService: CategoriesService) {
    this.editingMode = false;
  }

  ngOnInit(): void {

    // obter id
    this.id = Number(this._route.snapshot.paramMap.get('id')!);

    // obter snapshot do movimento
    [...this.treasuryService.treasuryLog].forEach(treasurylog => { if (treasurylog.id === this.id) { this.treasuryLog = treasurylog; return } });

    // clone do movimento para modo de edição
    this.tempTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));

    // clone do movimento enviado para o serviço
    this.treasuryService.activeTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));

    // datepicker
    this.treasuryLogDatepickerForm = new FormControl(new Date(this.treasuryLog.date), [Validators.required]);

    //  form controls para auto completes categorias/subcategorias
    this.catForm = new FormControl(this.treasuryService.getCategoryTitle(this.tempTreasuryLog.cat), [Validators.required]);
    this.subCatForm = new FormControl(this.treasuryService.getSubcategoryTitle(this.tempTreasuryLog.cat, this.treasuryLog.subcat), [Validators.required]);

    // criar array com os títulos das categorias/subcategorias
    this.catFormOptions = [];
    this.subCatFormOptions = [];

    [...this._categoriesService.allCategories].forEach(cat => {
      // adicionar titulo cat
      this.catFormOptions.push(cat.title)

      // adicionar subtitulos das categorias
      cat.subcats.forEach(subcat => {
        this.subCatFormOptions.push(subcat.title)
      });
    });

    // filtros autocompletes
    this.catFilteredOptions = this.catForm.valueChanges.pipe(
      startWith(''),
      map(value => this._catfilter(value || '')),
    );
    this.subCatFilteredOptions = this.subCatForm.valueChanges.pipe(
      startWith(''),
      map(value => this._subcatfilter(value || '')),
    );

    // trigger remoto do OnInit
    this.treasuryService.onInitTrigger.subscribe(myCustomParam => {
      this.ngOnInit();
    });
  }

  saveTreasurylog(): void {

    const httpParams = new HttpParams().set('tlog', JSON.stringify(this.tempTreasuryLog))
    const call = this._http.post('http://localhost:16190/updatetreasurylog', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.treasuryService.fetchTreasuryLog('saveTreasuryLog', this.tempTreasuryLog.id); this.editingMode = false; },
      error: err => this.treasuryService.handleError(err)
    })
  }

  editingTreasuryLogRecordActions(action: string): void {

    switch (action) {

      case 'start':

        this.tempTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));
        this.editingMode = true;
        break;

      case 'save':

        if (this.catForm.errors || this.subCatForm.errors) { return alert('fuck you') }

        this.tempTreasuryLog.date = this.treasuryLogDatepickerForm.value.getTime();

        let catID: number; // id da categoria
        let catBGColor: string // cor da categoria
        let subCats: IFinancialSubCategory[]; // subcats da categoria selecioanda

        // obter o ID, BGColor e SubCategorias  da categoria selecionada
        [...this._categoriesService.allCategories].forEach(cat => {
          if (cat.title === this.catForm.value) { catBGColor = cat.bgcolor; subCats = cat.subcats; catID = cat.id; return; }
        });

        // obter o ID da sub-categoria selecionada
        let subCatID: number;
        subCats!.forEach(subcat => {
          if (subcat.title === this.subCatForm.value) { subCatID = subcat.id; return; }
        });

        // converter de títilo para o id das catgorias
        this.tempTreasuryLog.cat = catID!;
        this.tempTreasuryLog.subcat = subCatID!;

        this.treasuryService.recordBorderStyle['background-color'] = catBGColor!;
        this.saveTreasurylog();

        break;

      case 'end': default:
        this.editingMode = false;
    }
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(DeleteTreasuryLogConfirmationModal, {
      width: '50vw',
      height: '50vh',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

}

@Component({
  selector: 'delete-tlog-confirmation-modal',
  templateUrl: './delete-tlog-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-large-modal.scss']
})

export class DeleteTreasuryLogConfirmationModal {

  constructor(public treasuryService: TreasuryService, private _http: HttpClient) { }

  deleteTreasuryLog() {

    const httpParams = new HttpParams().set('tlog', this.treasuryService.activeTreasuryLog.id)
    const call = this._http.post('http://localhost:16190/deletetreasurylog', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.treasuryService.fetchTreasuryLog('deleteTreasuryLog'); },
      error: err => this.treasuryService.handleError(err)
    })
  }
}

