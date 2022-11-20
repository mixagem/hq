import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoriesService } from '../../categories/categories.service';
import { AnalysisService, MVDGraph } from '../analysis.service';


@Component({
  selector: 'mhq-graph-config-modal',
  templateUrl: './graph-config-modal.component.html',
  styleUrls: ['../../../../../shared/styles/mhq-modal.scss', './graph-config-modal.component.scss']
})

export class GraphConfigModalComponent implements OnInit {

  header: FormGroup; // form group para campos do cabeçalho
  controls: FormControl[][]; // array de formcontrols [[form control para a categoria selecionada, form control para valor invertido]]

  editingMode: boolean;
  tempGraphConfig: MVDGraph; // config do gráfico para o modo de edição

  constructor(public analysisService: AnalysisService, public categoriesService: CategoriesService) {
    this.analysisService.waitingForSQL = true;
    this.analysisService.fetchGraphConfig(this.analysisService.selectedGraphID);
  }

  ngOnInit(): void {
    this.analysisService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (this.analysisService.waitingForSQL) { return }
    this.tempGraphConfig = JSON.parse(JSON.stringify(this.analysisService.graphConfig))
    this.analysisService.waitingForSQL = false;
  }

  addParameterToGraph(): void { this.controls.push([new FormControl(-1, [Validators.required]), new FormControl(false, [Validators.required])]) }

  removeParameterFromGraph(index: number): void { this.controls = this.controls.filter((control: FormControl[], i: number) => i !== index) }

  // categoria <-> subcategoria
  targetSwap(e: any): void {
    if (e.value === this.tempGraphConfig.target) { this.enteringEditingMode(); }// se voltarmos à opção original, damos reset ao invocar outra vez o editing mode
    else { this.controls = [[new FormControl(-1, [Validators.required]), new FormControl(false, [Validators.required])]] } // caso contrário, é preciso resetar os controls
  }

  enteringEditingMode(): void {
    this.editingMode = true;
    this.header = new FormGroup({
      title: new FormControl(this.tempGraphConfig.title, [Validators.required]),
      year: new FormControl(this.tempGraphConfig.year, [Validators.required]),
      duration: new FormControl(this.tempGraphConfig.duration, [Validators.required]),
      acomul: new FormControl(this.tempGraphConfig.acomul, [Validators.required]),
      target: new FormControl(this.tempGraphConfig.target, [Validators.required])
    });

    if (this.tempGraphConfig.target === 'subcat') {
      this.controls = new Array(this.tempGraphConfig.subcat?.length);
      this.tempGraphConfig.subcat!.forEach((subcat, i) => {
        this.controls[i] = []
        this.controls[i].push(new FormControl(subcat, [Validators.required]))
        this.controls[i].push(new FormControl(this.tempGraphConfig.inverted![i], [Validators.required]))
      });
    }
    if (this.tempGraphConfig.target === 'cat') {
      this.controls = new Array(this.tempGraphConfig.cat?.length).fill([]);
      this.tempGraphConfig.cat!.forEach((cat, i) => {
        this.controls[i] = []
        this.controls[i].push(new FormControl(cat, [Validators.required]))
        this.controls[i].push(new FormControl(this.tempGraphConfig.inverted![i], [Validators.required]))
      });
    }
  }

  exitingEditingMode(): void { this.editingMode = false; }

  saveGraphSettings(): void {
    // tratamento da config do gráfico (passar dos formControls para o objecto)
    this.tempGraphConfig.title = this.header.controls['title'].value
    this.tempGraphConfig.duration = this.header.controls['duration'].value
    this.tempGraphConfig.year = this.header.controls['year'].value
    this.tempGraphConfig.acomul = this.header.controls['acomul'].value
    this.tempGraphConfig.target = this.header.controls['target'].value

    // tratamento cat/subcat
    if (this.tempGraphConfig.target === 'subcat') { this.tempGraphConfig.subcat = []; delete this.tempGraphConfig.cat }
    if (this.tempGraphConfig.target === 'cat') { this.tempGraphConfig.cat = []; delete this.tempGraphConfig.subcat }
    this.tempGraphConfig.inverted = [];

    // valor categoria/subcategoria + valor invertido
    this.controls.forEach((control, i) => {
      if (this.tempGraphConfig.target === 'subcat') { this.tempGraphConfig.subcat!.push(control[0].value) }
      if (this.tempGraphConfig.target === 'cat') { this.tempGraphConfig.cat!.push(control[0].value) }
      this.tempGraphConfig.inverted!.push(control[1].value)
    });

    // enviar a config para bd
    this.analysisService.saveGraphConfig(this.analysisService.selectedGraphID, this.tempGraphConfig)
    this.editingMode = false;
  }


}