import { Directive, ElementRef, Input, AfterContentInit } from '@angular/core';
import * as models from '../lib/models';

declare var componentHandler : any;

@Directive({
    selector: 'on-ready'
})
export class OnReadyDirective implements AfterContentInit{

    @Input('image') image: models.DisplayingImage;
    ngAfterContentInit() {
        setTimeout(() => this.image.initPerspectiveTransform(true), 0);
    }
}