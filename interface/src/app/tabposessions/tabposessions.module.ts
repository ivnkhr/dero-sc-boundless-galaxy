import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabposessionsPage } from './tabposessions.page';
import { PlanetrendererComponent } from '../planetrenderer/planetrenderer.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: TabposessionsPage }
    ])
  ],
  declarations: [TabposessionsPage, PlanetrendererComponent]
})
export class TabposessionsPageModule {}
