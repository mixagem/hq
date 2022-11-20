import { Component, OnInit } from '@angular/core';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoriesService } from '../../categories/categories.service';
import { AnalysisService } from '../analysis.service';

type GraphTarget = 'cat' | 'subcat'

type MVDGraph = { id: number, title: string, year: number, duration: number, acomul: boolean, target: GraphTarget, cat?: number[], subcat?: number[], inverted?: boolean[] }

@Component({
  selector: 'mhq-graph-config-modal',
  templateUrl: './graph-config-modal.component.html',
  styleUrls: ['../../../../../shared/styles/mhq-modal.scss', './graph-config-modal.component.scss']
})

export class GraphConfigModalComponent implements OnInit {

  header: FormGroup;
  editingMode: boolean;
  controls: any[][]; // [0] é o valor da subcat, [1] é o valor do invertido
  tempGraphConfig: MVDGraph;

  constructor(public analysisService: AnalysisService, public categoriesService: CategoriesService) {
    this.analysisService.waitingForSQL = true;
    this.analysisService.fetchGraphConfig(this.analysisService.selectedGraph);
  }

  ngOnInit(): void {
    this.analysisService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (this.analysisService.waitingForSQL) { return }
    this.tempGraphConfig = JSON.parse(JSON.stringify(this.analysisService.graphConfig))

    this.analysisService.waitingForSQL = false;
  }

  addParameterToGraph(): void {
    this.controls.push([new FormControl(-1, [Validators.required]), new FormControl(false, [Validators.required])])
  }

  removeParameterFromGraph(index: number): void {
    this.controls = this.controls.filter((control: any[], i: number) => i !== index)
  }

  targetSwap(e: any): void {
    console.log(this.tempGraphConfig.target)
    if (e.value === this.tempGraphConfig.target) { this.enteringEditingMode(); } else {
      this.controls = [[new FormControl(-1, [Validators.required]), new FormControl(false, [Validators.required])]]
    }
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

  exitingEditingMode(): void {
    this.editingMode = false;
  }

  saveGraphSettings(): void {
    this.tempGraphConfig.title = this.header.controls['title'].value
    this.tempGraphConfig.duration = this.header.controls['duration'].value
    this.tempGraphConfig.year = this.header.controls['year'].value
    this.tempGraphConfig.acomul = this.header.controls['acomul'].value
    this.tempGraphConfig.target = this.header.controls['target'].value
    this.tempGraphConfig.subcat = [];
    this.tempGraphConfig.inverted = [];

    // debugger
    this.controls.forEach((control, i) => {
      this.tempGraphConfig.subcat!.push(control[0].value)
      this.tempGraphConfig.inverted!.push(control[1].value)
    });


    this.analysisService.saveGraphConfig(this.analysisService.selectedGraph, this.tempGraphConfig)
    this.editingMode = false;
  }

}