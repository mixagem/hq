
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdvancedTreasurySearchService } from './treasury-searchbox/advanced-treasury-search/advanced-treasury-search.service';

@Component({
  selector: 'mhq-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit(): void {
  }


}
