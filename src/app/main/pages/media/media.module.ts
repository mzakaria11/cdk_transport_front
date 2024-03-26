import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaComponent } from './media.component';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreCommonModule } from '@core/common.module';
import { MediaService } from './media.service';

// routing
const routes: Routes = [
  {
    path: ':bc',
    component: MediaComponent,
    resolve: {
      mds: MediaService
    },
  }
];

@NgModule({
  declarations: [MediaComponent],
  imports: [
    CommonModule, 
    RouterModule.forChild(routes), 
    NgbModule, 
    FormsModule, 
    ReactiveFormsModule, 
    CoreCommonModule
  ]
})
export class MediaModule { }
