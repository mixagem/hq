import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { CategoriesService } from '../../categories/categories.service';
import { AnalysisService } from '../analysis.service';

type EvolutionGraph = { title: string, cat: number, subcats: number[], year: number, duration: number }
type HeaderForm = {title:FormControl, year: FormControl, duration: FormControl }

@Component({
  selector: 'mhq-analysis-evolution-config-modal',
  templateUrl: './analysis-evolution-config-modal.component.html',
  styleUrls: ['../../../../../shared/styles/mhq-modal.scss', './analysis-evolution-config-modal.component.scss']
})


export class AnalysisEvolutionConfigModalComponent implements OnInit {

  header: HeaderForm;
  editingMode: boolean;
  evolution: EvolutionGraph;
  catControl: FormControl;
  subcatControls: FormControl[];

  constructor(public analysisService: AnalysisService, public categoriesService: CategoriesService) {
    this.subcatControls = [];
    this.analysisService.waitingForSQL = true;
    this.analysisService.fetchGraphConfig('evo');
  }

  ngOnInit(): void {
    this.analysisService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (this.analysisService.waitingForSQL) { return }

    this.evolution = JSON.parse(JSON.stringify(this.analysisService.graphConfig))
    this.analysisService.refreshSubcategoryList(this.analysisService.graphConfig.cat);
    this.analysisService.waitingForSQL = false;
  }

  enteringEditingMode(): void {
    this.editingMode = true;
    this.header = {
      title: new FormControl(this.evolution.title, [Validators.required]),
      year:  new FormControl(this.evolution.year, [Validators.required]),
      duration:  new FormControl(this.evolution.duration, [Validators.required])
    }
    this.catControl = new FormControl(this.evolution.cat, [Validators.required])
    this.subcatControls = [];
    this.evolution.subcats.forEach(subcat => {
      console.log(subcat)
      this.subcatControls.push(new FormControl(subcat, [Validators.required]))
    });
  }

  exitingEditingMode(): void {
    this.editingMode = false;
  }

  saveGraphSettings(): void {
    this.evolution.title = this.header.title.value
    this.evolution.duration = this.header.duration.value
    this.evolution.year = this.header.year.value
    this.evolution.cat = this.catControl.value
    this.evolution.subcats.forEach((subcat, i) => {
      this.evolution.subcats[i] = this.subcatControls[i].value
    });
    this.analysisService.saveGraphConfig('evo',JSON.stringify(this.evolution))
    this.editingMode = false;
  }

  catChanged(event: MatSelectChange): void {
    this.analysisService.refreshSubcategoryList(event.value);
    this.evolution.subcats.forEach((subcat, i) => {
      this.subcatControls[i] = new FormControl(-1, [Validators.required])
      Object.keys(this.analysisService.subcategoriesList).length > 0 ? this.subcatControls[i].enable() : this.subcatControls[i].disable();
    });
    //
  }



}
