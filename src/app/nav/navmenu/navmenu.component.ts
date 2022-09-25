import { Component, OnInit } from '@angular/core';
import { NavmenuService } from './navmenu.service';


@Component({
  selector: 'mhq-navmenu',
  templateUrl: './navmenu.component.html',
  styleUrls: ['./navmenu.component.scss']
})

export class NavmenuComponent implements OnInit {
  isMenuOpen: boolean;

  constructor(public navmenuService: NavmenuService) { }

  ngOnInit(): void { this.isMenuOpen = false; }

  menuEntryClick(event: Event): void {
    let clickTarget = event.target as Element;
    let clickAlias: string = clickTarget.classList[0]       // clickAlias: mhq-main-title-x | mhq-sub-title-x
    if (clickAlias.includes('mhq-sub-title-')) { return }   // clicks em sub-menus não fazem nada (apenas re-route)
    clickAlias = clickAlias.replace('mhq-main-title-', ''); // clickAlias: x
    clickAlias = clickAlias.replace('mhq-sub-title-', '');  // (estamos a remover o pre-fixo do leggera e ficamos apenas com o alias do menu)
    // daqui para a frente só chegam clicks em menus principais
    let childList = document.querySelectorAll(`.mhq-sub-title-${clickAlias}`)// número de sub-menus do menu clickado
    if (childList.length <= 0) { return } // se o menu clickado não tem sub-menus, não faz nada (apenas re-route)
    if (!this.isMenuOpen) {
      childList.forEach(function (child) { child.classList.remove('hidden'); })             // mostar a lista de sub-menus
      let expandChevron = document.querySelector(`.expand-more-${clickAlias}`) as Element;  // alterar a orientação do chevron
      expandChevron.innerHTML = 'expand_less';
      this.displayMenuChevrons();
    } else {
      if (childList[0].classList.contains('hidden')) {                                      // mostrar os sub-menus caso estejam escondidos
        childList.forEach(function (child) { child.classList.remove('hidden') });
        let expandChevron = document.querySelector(`.expand-more-${clickAlias}`) as Element;
        expandChevron.innerHTML = 'expand_less';
      } else {
        childList.forEach(function (child) { child.classList.add('hidden') });              // ocultar os sub-menus caso estejam visiveis
        let expandChevron = document.querySelector(`.expand-more-${clickAlias}`) as Element;
        expandChevron.innerHTML = 'expand_more';
      }
    }
  }

  displayMenuChevrons(): void {
    let allChevrons = document.querySelectorAll('[class*="expand-more-"]');
    this.isMenuOpen ? allChevrons.forEach(function (chevron) { chevron.classList.add('hidden'); }) : allChevrons.forEach(function (chevron) { chevron.classList.remove('hidden'); });
    this.isMenuOpen = !this.isMenuOpen;
  }

}
