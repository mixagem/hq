import { Injectable } from '@angular/core';
import { IAdvancedSearch } from 'src/shared/interfaces/iadanved-search';

@Injectable({
  providedIn: 'root'
})
export class AdvancedTreasurySearchService {
  activeSearch: IAdvancedSearch

  constructor() {

  }

}
