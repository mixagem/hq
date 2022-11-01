import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeHTML'
})

// previne que o angular limpe as tags ao fazer preview
export class SanitizeHTMLPipe implements PipeTransform {

  constructor(private sanitizer:DomSanitizer) {}

  transform(htmlSnipet:string):SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlSnipet);
  }

}




