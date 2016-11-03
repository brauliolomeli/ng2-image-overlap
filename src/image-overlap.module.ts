import { NgModule } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { OverlapperComponent } from './overlapper/overlapper.component';
import { OnReadyDirective } from './lib/on-ready.directive';


@NgModule({
  declarations: [
    OverlapperComponent,
    OnReadyDirective
  ],
  exports: [
    OverlapperComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [ ]
})
export class ImageOverlapModule { }
