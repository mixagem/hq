import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CategoriesService } from '../../categories/categories.service';
import { AnalysisService } from '../analysis.service';

type HeadToHeadGraph = { title: string, cats: number[], year: number, duration: number }

@Component({
  selector: 'mhq-analysis-headto-head-config-modal',
  templateUrl: './analysis-headto-head-config-modal.component.html',
  styleUrls: ['../../../../../shared/styles/mhq-modal.scss','./analysis-headto-head-config-modal.component.scss']
})

export class AnalysisHeadtoHeadConfigModalComponent implements OnInit {

  headtohead:HeadToHeadGraph
  editingMode: boolean;
  catControls : FormControl[];

  constructor(public analysisService:AnalysisService, public categoriesService:CategoriesService) {
    this.analysisService.waitingForSQL = true;
    this.analysisService.fetchGraphConfig('h2h');
  }

  ngOnInit(): void {
    console.log('aki')
    this.analysisService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (this.analysisService.waitingForSQL) { return }
    console.log('aki')
    // this.headtohead = {
    //   title: "Evolução poupanças",
    //   cats: [1, 2],
    //   year: 2013,
    //   duration: 1
    // }
    this.headtohead = JSON.parse(JSON.stringify(this.analysisService.graphConfig))
    this.analysisService.waitingForSQL = false;
  }


  enteringEditingMode():void {
    this.editingMode = true;

    this.catControls = [];

    this.headtohead.cats.forEach(cat => {
      this.catControls.push(new FormControl(cat, [Validators.required]))
    });
  }

  exitingEditingMode():void {
    this.editingMode = false;
  }

  saveGraphSettings():void {
    this.headtohead.cats.forEach((cats,i) => {
      this.headtohead.cats[i] = this.catControls[i].value
    });
    console.table(this.headtohead)
  }

}
