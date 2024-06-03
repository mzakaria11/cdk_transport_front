import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LettrevoituresortieNewComponent } from './lettrevoituresortie-new/lettrevoituresortie-new.component';
import { LettrevoituresortieNewService } from './lettrevoituresortie-new/lettrevoituresortie-new.service';
import { Role } from 'app/auth/models';
import { RouterModule, Routes } from '@angular/router';
import { CoreCommonModule } from '@core/common.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CoreSidebarModule } from '@core/components';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { FileUploadModule } from 'ng2-file-upload';

const routes: Routes = [
  {
    path: 'new',
    component: LettrevoituresortieNewComponent,

    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User] }
  }
];

@NgModule({
  declarations: [
    LettrevoituresortieNewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    NgxDatatableModule,
    CorePipesModule,
    CoreDirectivesModule,
    CoreSidebarModule,
    ContentHeaderModule,
    FileUploadModule
  ]
})
export class LettrevoituresortieModule { }
