import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { TimerService } from 'src/assets/services/misc.service';
import { GridViewService } from './content/financial/grid-view/grid-view.service';

@Component({
  selector: 'mhq-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'hq';

  constructor(private _router: Router, private _timerService: TimerService, private _gridViewService: GridViewService) {

    this._router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        clearTimeout(this._timerService.timer);
        if (event.url === "/fi/grid") {
          this._router.navigateByUrl(`/fi/grid/${this._gridViewService.selectedView}`)
         }
      }
    });

  }
}

