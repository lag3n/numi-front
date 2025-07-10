import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TopcontainerComponent } from './topcontainer/topcontainer.component';
import { BottomcontainerComponent } from './bottomcontainer/bottomcontainer.component';

@NgModule({
  declarations: [
    TopcontainerComponent,
    BottomcontainerComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    TopcontainerComponent,
    BottomcontainerComponent
  ]
})
export class SharedModule { }
