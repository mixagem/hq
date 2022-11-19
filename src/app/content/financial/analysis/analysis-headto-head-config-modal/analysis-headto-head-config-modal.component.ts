import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CategoriesService } from '../../categories/categories.service';
import { AnalysisService } from '../analysis.service';

type HeadToHeadGraph = { title: string, cat: number[], year: number, duration: number }
type HeaderForm = {title:FormControl, year: FormControl, duration: FormControl }
@Component({
  selector: 'mhq-analysis-headto-head-config-modal',
  templateUrl: './analysis-headto-head-config-modal.component.html',
  styleUrls: ['../../../../../shared/styles/mhq-modal.scss','./analysis-headto-head-config-modal.component.scss']
})

export class AnalysisHeadtoHeadConfigModalComponent implements OnInit {

  header: HeaderForm;
  headtohead:HeadToHeadGraph
  editingMode: boolean;
  catControls : FormControl[];

  constructor(public analysisService:AnalysisService, public categoriesService:CategoriesService) {
    this.analysisService.waitingForSQL = true;
    this.analysisService.fetchGraphConfig('h2h');
  }

  ngOnInit(): void {
    this.analysisService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (this.analysisService.waitingForSQL) { return }

    this.headtohead = JSON.parse(JSON.stringify(this.analysisService.graphConfig))
    this.analysisService.waitingForSQL = false;
  }


  enteringEditingMode():void {
    this.editingMode = true;
    this.header = {
      title: new FormControl(this.headtohead.title, [Validators.required]),
      year:  new FormControl(this.headtohead.year, [Validators.required]),
      duration:  new FormControl(this.headtohead.duration, [Validators.required])
    }
    this.catControls = [];

    this.headtohead.cat.forEach(cat => {
      this.catControls.push(new FormControl(cat, [Validators.required]))
    });
  }

  exitingEditingMode():void {
    this.editingMode = false;
  }

  saveGraphSettings():void {
    this.headtohead.title = this.header.title.value
    this.headtohead.duration = this.header.duration.value
    this.headtohead.year = this.header.year.value
    this.headtohead.cat.forEach((cat,i) => {
      this.headtohead.cat[i] = this.catControls[i].value
    });
    this.analysisService.saveGraphConfig('h2h',JSON.stringify(this.headtohead))
  }

}
