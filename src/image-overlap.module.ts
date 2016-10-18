import { NgModule } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { OverlapperComponent } from './overlapper/overlapper.component';


@NgModule({
  declarations: [
    OverlapperComponent
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
